[1mdiff --git a/janus/static/plugins/sigma.exporters.svg/README.md b/janus/static/plugins/sigma.exporters.svg/README.md[m
[1mdeleted file mode 100644[m
[1mindex bc188e6..0000000[m
[1m--- a/janus/static/plugins/sigma.exporters.svg/README.md[m
[1m+++ /dev/null[m
[36m@@ -1,41 +0,0 @@[m
[31m-sigma.exporters.svg[m
[31m-========================[m
[31m-[m
[31m-Plugin by [Guillaume Plique](https://github.com/Yomguithereal).[m
[31m-[m
[31m----[m
[31m-[m
[31m-This plugin aims at providing an easy way to export a graph as a SVG file.[m
[31m-[m
[31m-*Basic usage*[m
[31m-[m
[31m-```js[m
[31m-// Retrieving the svg file as a string[m
[31m-var svgString = sigInst.toSVG();[m
[31m-[m
[31m-// Dowload the svg file[m
[31m-sigInst.toSVG({download: true, filename: 'my-fancy-graph.svg'});[m
[31m-```[m
[31m-[m
[31m-*Complex usage*[m
[31m-[m
[31m-```js[m
[31m-sigInst.toSVG({[m
[31m-  labels: true,[m
[31m-  classes: false,[m
[31m-  data: true,[m
[31m-  download: true,[m
[31m-  filename: 'hello.svg'[m
[31m-});[m
[31m-```[m
[31m-[m
[31m-*Parameters*[m
[31m-[m
[31m-* **size** *?integer* [`1000`]: size of the svg canvas in pixels.[m
[31m-* **height** *?integer* [`1000`]: height of the svg canvas in pixels (useful only if you want a height different from the width).[m
[31m-* **width** *?integer* [`1000`]: width of the svg canvas in pixels (useful only if you want a width different from the height).[m
[31m-* **classes** *?boolean* [`true`]: should the exporter try to optimize the svg document by creating classes?[m
[31m-* **labels** *?boolean* [`false`]: should the labels be included in the svg file?[m
[31m-* **data** *?boolean* [`false`]: should additional data (node ids for instance) be included in the svg file?[m
[31m-* **download** *?boolean* [`false`]: should the exporter make the browser download the svg file?[m
[31m-* **filename** *?string* [`'graph.svg'`]: filename of the file to download.[m
[1mdiff --git a/janus/static/plugins/sigma.exporters.svg/sigma.exporters.svg.js b/janus/static/plugins/sigma.exporters.svg/sigma.exporters.svg.js[m
[1mdeleted file mode 100644[m
[1mindex 9963843..0000000[m
[1m--- a/janus/static/plugins/sigma.exporters.svg/sigma.exporters.svg.js[m
[1m+++ /dev/null[m
[36m@@ -1,224 +0,0 @@[m
[31m-;(function(undefined) {[m
[31m-  'use strict';[m
[31m-[m
[31m-  /**[m
[31m-   * Sigma SVG Exporter[m
[31m-   * ===================[m
[31m-   *[m
[31m-   * This plugin is designed to export a graph to a svg file that can be[m
[31m-   * downloaded or just used elsewhere.[m
[31m-   *[m
[31m-   * Author: Guillaume Plique (Yomguithereal)[m
[31m-   * Version: 0.0.1[m
[31m-   */[m
[31m-[m
[31m-  // Terminating if sigma were not to be found[m
[31m-  if (typeof sigma === 'undefined')[m
[31m-    throw 'sigma.renderers.snapshot: sigma not in scope.';[m
[31m-[m
[31m-[m
[31m-  /**[m
[31m-   * Polyfills[m
[31m-   */[m
[31m-  var URL = this.URL || this.webkitURL || this;[m
[31m-[m
[31m-[m
[31m-  /**[m
[31m-   * Utilities[m
[31m-   */[m
[31m-  function createBlob(data) {[m
[31m-    return new Blob([m
[31m-      [data],[m
[31m-      {type: 'image/svg+xml;charset=utf-8'}[m
[31m-    );[m
[31m-  }[m
[31m-[m
[31m-  function download(string, filename) {[m
[31m-[m
[31m-    // Creating blob href[m
[31m-    var blob = createBlob(string);[m
[31m-[m
[31m-    // Anchor[m
[31m-    var o = {};[m
[31m-    o.anchor = document.createElement('a');[m
[31m-    o.anchor.setAttribute('href', URL.createObjectURL(blob));[m
[31m-    o.anchor.setAttribute('download', filename);[m
[31m-[m
[31m-    // Click event[m
[31m-    var event = document.createEvent('MouseEvent');[m
[31m-    event.initMouseEvent('click', true, false, window, 0, 0, 0 ,0, 0,[m
[31m-      false, false, false, false, 0, null);[m
[31m-[m
[31m-    URL.revokeObjectURL(blob);[m
[31m-[m
[31m-    o.anchor.dispatchEvent(event);[m
[31m-    delete o.anchor;[m
[31m-  }[m
[31m-[m
[31m-[m
[31m-  /**[m
[31m-   * Defaults[m
[31m-   */[m
[31m-  var DEFAULTS = {[m
[31m-    size: '1000',[m
[31m-    width: '1000',[m
[31m-    height: '1000',[m
[31m-    classes: true,[m
[31m-    labels: true,[m
[31m-    data: false,[m
[31m-    download: false,[m
[31m-    filename: 'graph.svg'[m
[31m-  };[m
[31m-[m
[31m-  var XMLNS = 'http://www.w3.org/2000/svg';[m
[31m-[m
[31m-[m
[31m-  /**[m
[31m-   * Subprocesses[m
[31m-   */[m
[31m-  function optimize(svg, prefix, params) {[m
[31m-    var nodeColorIndex = {},[m
[31m-        edgeColorIndex = {},[m
[31m-        count = 0,[m
[31m-        color,[m
[31m-        style,[m
[31m-        styleText = '',[m
[31m-        f,[m
[31m-        i,[m
[31m-        l;[m
[31m-[m
[31m-    // Creating style tag if needed[m
[31m-    if (params.classes) {[m
[31m-      style = document.createElementNS(XMLNS, 'style');[m
[31m-      svg.insertBefore(style, svg.firstChild);[m
[31m-    }[m
[31m-[m
[31m-    // Iterating over nodes[m
[31m-    var nodes = svg.querySelectorAll('[id="' + prefix + '-group-nodes"] > [class="' + prefix + '-node"]');[m
[31m-[m
[31m-    for (i = 0, l = nodes.length, f = true; i < l; i++) {[m
[31m-      color = nodes[i].getAttribute('fill');[m
[31m-[m
[31m-      if (!params.data)[m
[31m-        nodes[i].removeAttribute('data-node-id');[m
[31m-[m
[31m-      if (params.classes) {[m
[31m-[m
[31m-        if (!(color in nodeColorIndex)) {[m
[31m-          nodeColorIndex[color] = (f ? prefix + '-node' : 'c-' + (count++));[m
[31m-          styleText += '.' + nodeColorIndex[color] + '{fill: ' + color + '}';[m
[31m-        }[m
[31m-[m
[31m-        if (nodeColorIndex[color] !== prefix + '-node')[m
[31m-          nodes[i].setAttribute('class', nodes[i].getAttribute('class') + ' ' + nodeColorIndex[color]);[m
[31m-        nodes[i].removeAttribute('fill');[m
[31m-      }[m
[31m-[m
[31m-      f = false;[m
[31m-    }[m
[31m-[m
[31m-    // Iterating over edges[m
[31m-    var edges = svg.querySelectorAll('[id="' + prefix + '-group-edges"] > [class="' + prefix + '-edge"]');[m
[31m-[m
[31m-    for (i = 0, l = edges.length, f = true; i < l; i++) {[m
[31m-      color = edges[i].getAttribute('stroke');[m
[31m-[m
[31m-      if (!params.data)[m
[31m-        edges[i].removeAttribute('data-edge-id');[m
[31m-[m
[31m-      if (params.classes) {[m
[31m-[m
[31m-        if (!(color in edgeColorIndex)) {[m
[31m-          edgeColorIndex[color] = (f ? prefix + '-edge' : 'c-' + (count++));[m
[31m-          styleText += '.' + edgeColorIndex[color] + '{stroke: ' + color + '}';[m
[31m-        }[m
[31m-[m
[31m-        if (edgeColorIndex[color] !== prefix + '-edge')[m
[31m-          edges[i].setAttribute('class', edges[i].getAttribute('class') + ' ' + edgeColorIndex[color]);[m
[31m-        edges[i].removeAttribute('stroke');[m
[31m-      }[m
[31m-[m
[31m-      f = false;[m
[31m-    }[m
[31m-[m
[31m-    if (params.classes)[m
[31m-      style.appendChild(document.createTextNode(styleText));[m
[31m-  }[m
[31m-[m
[31m-[m
[31m-  /**[m
[31m-   * Extending prototype[m
[31m-   */[m
[31m-  sigma.prototype.toSVG = function(params) {[m
[31m-    params = params || {};[m
[31m-[m
[31m-    var prefix = this.settings('classPrefix'),[m
[31m-        w = params.size || params.width || DEFAULTS.size,[m
[31m-        h = params.size || params.height || DEFAULTS.size;[m
[31m-[m
[31m-    // Creating a dummy container[m
[31m-    var container = document.createElement('div');[m
[31m-    container.setAttribute('width', w);[m
[31m-    container.setAttribute('height', h);[m
[31m-    container.setAttribute('style', 'position:absolute; top: 0px; left:0px; width: ' + w + 'px; height: ' + h + 'px;');[m
[31m-[m
[31m-    // Creating a camera[m
[31m-    var camera = this.addCamera();[m
[31m-[m
[31m-    // Creating a svg renderer[m
[31m-    var renderer = this.addRenderer({[m
[31m-      camera: camera,[m
[31m-      container: container,[m
[31m-      typ
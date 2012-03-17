JSON Editor是一个可视化的JSON编辑器，其拥有以下特点：

1. 可解析正确的JSON格式，需满足[JSON语法](http://json.org/ "json.org")的文本才会被正确解析。
2. 以缩进的形式展现JSON的层级结构，可清晰地查看整个JSON的数据。拥有清晰的DOM结构和类名，可定制式地通过CSS控制视觉效果。
3. 可在JSON原生定义的类型基础上进行扩展，得到新的类型以提供特殊的展示和交互效果。
4. 定义了一个`Visualizer`，可将任意对象渲染到特定容器中，以便脱离编辑器本身使用。
5. 可监听可视化展现中的事件，以添加、修改可视元素。
6. JSON Editor默认仅具有将JSON可视化展现的效果，不带有任何编辑功能。但提供了一套完整的插件体系，可以方便、快捷地加入插件来实现各类编辑功能。

可以前往以下地址进行演示：http://216.24.195.182/JSONVisualizer/home

具体资源请[参见WIKI](https://github.com/otakustay/JSONEditor/wiki)
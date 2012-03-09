JSON Editor是一个可视化的JSON编辑器，其拥有以下特点：

1. 可解析正确的JSON格式，需满足[JSON语法](http://json.org/ "json.org")的文本才会被正确解析。
2. 以缩进的形式展现JSON的层级结构，可清晰地查看整个JSON的数据。拥有清晰的DOM结构和类名，可定制式地通过CSS控制视觉效果。
3. 可在JSON原生定义的类型基础上进行扩展，得到新的类型以提供特殊的展示和交互效果。
4. 定义了一个`Visualizer`，可将任意对象渲染到特定容器中，以便脱离编辑器本身使用。
5. 可监听可视化展现中的事件，以添加、修改可视元素。
6. JSON Editor默认仅具有将JSON可视化展现的效果，不带有任何编辑功能。但提供了一套完整的插件体系，可以方便、快捷地加入插件来实现各类编辑功能。

## 将对象可视化 - `Visualizer`类型

`Visualizer`提供了最基本地将一个对象渲染为可视化DOM结构的功能。

### `visualizeTo(o, element)`函数

将指定的对象渲染到指定的容器元素中，该函数会**清空**`element`指定的DOM元素，并在元素中创建新的DOM结构。

#### 参数

* `o`

    需要渲染为可视化的对象，可以是任意javascript对象，但**建议不要**包含`function`、`Date`、`RegExp`等javascript内置，但JSON并未规定的类型的属性。

* `element`

    渲染的容器元素，要求该元素可包括[流式内容](http://www.whatwg.org/specs/web-apps/current-work/multipage/elements.html#flow-content-0 "Flow Content")，建议使用`<div>`元素。

    当未提供`element`参数时，会使用页面中id为`root`的元素作为容器。

#### 返回值

该函数返回`undefined`。

### `generatePropertySection(key, value, container)`函数

在指定的容器元素中渲染一个属性，属性包含键和值。

`generatePropertySection`函数将创建一个属性使用的容器元素，随后在该元素内分别添加键和值对应的DOM元素，并将属性容器元素放入`container`中。

`generatePropertySection`函数并不会清空`container`指定的元素的内容，因此如果需要纯净的内容，请自行清空`container`中的内容。

#### 参数

* `key`

    指定属性的键名，为字符串类型，如果提供的类型不为字符串，则会进行类型转换。

* `value`

    指定发展的值，可为任意类型，但**建议不要**使用`function`、`Date`、`RegExp`等javascript内置，但JSON并未规定的类型。

* `container`

    指定渲染的容器，该属性的具体DOM结构将被放置在该容器元素中，要求该元素可包括[流式内容](http://www.whatwg.org/specs/web-apps/current-work/multipage/elements.html#flow-content-0 "Flow Content")，建议使用`<div>`元素。

#### 返回值

该函数返回`undefined`。

### `fillPropertyElement(key, value, propertyElement)`函数

在一个属性用的容器元素中，添加键和值对应的DOM元素。

该函数不会清空`propertyElement`元素。

#### 参数

* `key`

    指定属性的键名，为字符串类型，如果提供的类型不为字符串，则会进行类型转换。

* `value`

    指定发展的值，可为任意类型，但**建议不要**使用`function`、`Date`、`RegExp`等javascript内置，但JSON并未规定的类型。

* `propertyElement`

    指定渲染的容器，该属性的具体DOM结构将被放置在该容器元素中，要求该元素可包括[流式内容](http://www.whatwg.org/specs/web-apps/current-work/multipage/elements.html#flow-content-0 "Flow Content")，建议使用`<div>`元素。

#### 返回值

该函数返回`undefined`。

### `updateProperty(oldProperty, newProperty, propertyElement)`函数

在指定的元素中，更新属性的信息。

该函数将通过属性变更的程度，来判断更新的手段。如果**属性的值的类型没有变更**，则将在不修改DOM结构的情况下，更新其中的文字信息；如果**属性的值的类型发生了变化**，如从字符串变为了数字，则会对DOM结构进行修改，这种情况下原有保存的DOM对象会失去作用，需要重新获取。

`updateProperty`函数接收2个属性信息，每个属性信息需要包含一个`key`属性表示属性的名称，一个`value`属性表示属性的值。

#### 参数

* `oldProperty`

变更前的属性的信息。

* `newProperty`

变更后属性的信息。

* `propertyElement`

原先用来存放属性对应元素的DOM容器。

#### 返回值

该函数返回`undefined`。

### `addVisualizingEventListener(type, targetPropertyType, handle)`函数

监听可视化渲染过程中的相关事件，通过`targetPropertyType`可监听特定类型的属性的事件，以免去在`handle`中反复添加`if`分支。

`addVisualizingEventListener`函数的`targetPropertyType`参数为可选参数，不提供该参数的情况下，将对所有类型的属性渲染进行监听。

`addVisualizingEventListener`函数保证事件触发时，处理函数的执行顺序与注册的顺序相同。但不保证一个处理函数仅执行一次，即可以将一个处理函数注册多次，在事件触发时同样会执行多次。

#### 参数

* `type`

指定监听的事件的名称。

* `targetPropertyType`

指定需要监听的目标属性的类型，如果监听了一个原生类型（如String类型），则该类型的所有子类型（如Date类型）上触发的事件也都符合条件，并进一步触发处理函数。

* `handle`

事件的处理函数，函数接受一个**事件对象**作为参数，事件对象的属性由不同类型的事件决定。

#### 返回值

该函数返回`undefined`。

### `dispatchVisualizingEvent(e)`函数

在可视化渲染的过程中触发一个事件。

`dispatchVisualizingEvent`函数将根据参数`e`中的`type`属性来判断触发的事件的类型，并执行预先注册的相应事件的处理函数。

#### 参数

* `e`

    事件对象，必须包含一个名为`type`的属性来确定事件的类型。

    在一次事件触发的过程中，所有处理函数都接受同一个对象作为参数，可通过修改该对象的属性来传递信息。
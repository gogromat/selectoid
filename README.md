Selectoid 
=========

![Selectoid](/libs/img/SelectoidLogoSmall.png "Selectoid!")

Selectoid is a JavaScript select box plugin.

The idea is nothing new: it's an attempt to make a user-friendly select box.

However Selectoid was specifically made to look like 
a tabular data rather than a dropdwon menu like most other select box plugins.


Project Dependencies:
---
 - ```jquery```

Installation
---
```npm install selectoid```
(You get what is in this project's dist folder)

Current version ```0.0.7```
- Now supports keyboard commands!

Inspiration
---
Selectoid was inspired by Google Translator's Select Box.
Also Selectoid is using CSS3 (media queries, transitions), lists/divs instead of tables.

Screenshot
---
Below you can compare the looks of both Selectoid Select Box and Google Translate's Select Box.

Selectoid
![Selectoid Select Box](/libs/img/selectoid.png "Selectoid Select Box")

Google Translator's Select Box
![Google Translator Select Box](/libs/img/google.png "Google Translator Select Box")

API
---
Selectoid is a single object called ```Selectoid``` that one must instantiate.

Constructor accepts either:
 - an *object* ```var ... = new Selectoid({ object:"#myDivId", data: [{name:"",value:""},...] });```
 - or an *id* of a div, *data object* and *inital value* ```var ... = new Selectoid("#myDivId", [{name:"",value:""},...], initialValue);```

Selectoid accepts either id string: ```"#myDivId"``` or jQuery object: Ex.1: ```$("#myDivId")``` Ex.2: ```$($(".selectods)[0])"```


Additional parameters that can be send with an object:
 - ```dateFormat(element)``` - function that returns a way to reference data elements' name and value attributes.

 - ```htmlFormat(element)``` - any data that you want to display instead of plain elements' name attribute.

 - ```parameters: {}``` - object that can have inner collections
    - ```classes:{"select":"selectClass", "button": "buttonClass", "holder":"holderClass"}``` - replaces default classes with user defined
    - ```ids:    {"select":"selectId",    "button": "buttonId", "holder":"holderId"}``` - replaces default ids with user defined
    - ```initial: "value"``` - sets initial select to a specified value (value must exist in a data object beforehand)
    - ```mouseLeaveClose: true|false``` - will 'mouseleave' action hide the select or not (default false)
    - ```focusOutClose: true|false``` - will 'focusout' action hide the select or not (default true)


Also the selectoid can have parameters specified as html5 data- attributes (`data-[]`).
Ex.: `<div class="selectoid" id="selectoid4" data-initial="bo" data-responsive="false"></div>`
- will create selectoid
- set initial value (option) to 'bo' 
- set selectoid to be NOT responsive (no eventListeners for change of width)

All options:
[select_class,button_class, holder_class, selectoid, select (id of select box), holder (id of holder), button
(id of button), itemHolder (id of div that holds items), item (class of items),  selected (class for selected items),
hidden (class for hidden elements), secondary (additional item's text data), widthElement (parent/id/body element on whose
width the selectoid relies for responsiveness, responsive: T/F, closeOnMouseLeave: T/F, closeOnFocusOut: T/F, addIdToParameter: T/F, addKeyboardAction: T/F]

Methods
---
- ```changeData()``` accepts: ([new data], "new initial value") or  {data:newData, dataFormat: {...}, parameters: {initial:"..."}, ...} }.
**changeData()** allows to change data of existing Selectoid together with its parameters.


Contribution
---
Feel free to contribute to the project! Selectoid is a pretty raw select box.
There was no cross-browser fine-tuning and no major testing is done.


Demo / Example
---
You can view the [demo page at this link](https://c9.io/gogromat_1/yodatalk/workspace/selectoid/index.html).

Source Code
---
The code is [avaiable on github at this link](https://github.com/gogromat/selectoid).

Updates
---
**Version 0.0.7**
- Selectoid now supports **keyboard events**! By default keyboard events are included, 
 but can be disable it with **addKeyboardAction: false** property.
- fixed bug where data-name was take only seeing first word of a value in multi-word values
- fixed bug where setting initial value to non-existing value would set value to undefined
- fixed width bug for iniitial element (was not responsive in smallest width case, because was checked
 against 0, not < 0, and value fell into first width selection)
- refactored lots of code (yay!)

**Version 0.0.6**

- Now new Selectoid will make by default its element id (selectoid id) as parameter of Selectoid object. [**addIdToParameter**]
- New method **changeData()** allows to change data of existing Selectoid together with its parameters.

**Version 0.0.5**

Selectoid now accepts both id and jQuery object. If the element you send has no id, Selectoid will
provide the default id "selectoid_[autoincrement #]" to it.
This is done so you can easily instantiate multiple Selectoid input fields by, say, their class name instead of an id.


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/gogromat/selectoid/trend.png)](https://bitdeli.com/free "Bitdeli Badge")


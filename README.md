Selectoid
=========

Selectoid is a JavaScript select box plugin.

Project Dependencies:
---
 - ```jquery```

The idea is nothing new: its an attempt to make a user-friendly select box.

However Selectoid was specifically made to look like 
a tabular data rather than a dropdwon menu like most other select box plugins.

Inspiration
---
Selectoid was inspired by Google Translator's Select Box.
Google's Select Box is a great example on how beautiful HTML/forn elements can be/become.

And yes, Selectoid is more light-weight than the Google's Select Box, (at least now), 
and it utilizes CSS3 (media queries, transitions), lists/divs instead of tables.

Screenshot
---
Below you can compare the looks of both Selectoid Select Box and Google Translate's Select Box.

Selectoid
![Selectoid Select Box](/libs/img/selectoid.png "Selectoid Select Box")

Google
![Google Translator Select Box](/libs/img/google.png "Google Translator Select Box")

API
---
Selectoid is a single object called ```Selectoid``` that one must instantiate.

Constructor accepts either 
 - an object ```var ... = new Selectoid({ object:"#myDivId", data: [{name:"",value:""},...] });
 - or an id of a div and data object ```var ... = new Selectoid("#myDivId", [{name:"",value:""},...]);```

Additional parameters can be send with an object:
 - ```dateFormat(element)``` - function that returns a way to reference data elements' name and value attributes.

 - ```htmlFormat(element)``` - any data that you want to display instead of plain elements' name attribute.

 - ```parameters: {}``` - object that can have inner collections
    - ```classes:{"select":"selectClass", "button": "buttonClass", "holder":"holderClass"}``` - replaces default classes with user defined
    - ```ids:    {"select":"selectId",    "button": "buttonId", "holder":"holderId"}``` - replaces default ids with user defined
    - ```initial: "value"``` - sets initial select to a specified value (value must exist in a data object beforehand)
    - ```mouseLeaveClose: true|false``` - will 'mouseleave' action hide the select or not (default false)
    - ```focusOutClose: true|false``` - will 'focusout' action hide the select or not (default true)


Contribution
---
Feel free to contribute to the project! Selectoid is a pretty raw select box.
There was no cross-browser fine-tuning and no major testing is done.


Demo / Example
---
You can view the [demo here](https://c9.io/gogromat_1/yodatalk/workspace/selectoid/index.html).

Source Code
---
The code is avaiable here. [Github link to the project](https://github.com/gogromat/selectoid).
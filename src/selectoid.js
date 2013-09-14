/* global jQuery */

(function ($) {
    
    var root = this, 
        Selectoid,
        __ = {};
        
        
    // Tells if jQuery's wrapped object is found in DOM
    $.fn.doesExist = function () { 
        return $(this).length > 0;
    };
    
    __.toType = function(obj) {
        return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
    };
        
    $.each(["Object", "Undefined"], function (i, name) {
        __["is" + name] = function (variable) {
            return __.toType(variable) == name.toLowerCase();
        };
    });
    
    __.isJQuery = function (object) {
        return object instanceof jQuery;
    };
    
    __.getAndSetId = (function (prefix) {
        var incrementingId = 0;
        prefix = prefix || "";
        return function (element) {
            if (!element.id) element.id = prefix + incrementingId++;
            return element.id;
        };
    })("selectoid_");
        
        
    Selectoid = function (object, data, initial) {
        
        var self = this;
        
        // Set Selectoid id (main div) as early as possible
        if (__.isObject(object)) {
            if (__.isJQuery(object.object)) self.object = object.object;
            else self.object = $(object.object);
        } else {
            if (__.isJQuery(object)) self.object = object;
            else self.object = $(object);
        }
        
        self.objectId = self.object.attr("id") || __.getAndSetId(self.object.get(0));

     
        // CLASSES
        self.defaults = {
            
            select_class: "selectoid_select",
            button_class: "selectoid_button",
            holder_class: "selectoid_holder",
            
            selectoid:    self.objectId,
            
            select:       self.objectId + "_select",
            holder:       self.objectId + "_holder",
            button:       self.objectId + "_button",
            
            item:         "item",
            selected:     "selected",
            hidden:       "hidden",
            
            secondary:    "secondary",
            
            widthElement: "body",
        
            // default actions -all keys and their default values
            actions: {
                responsive:         true,
                closeOnMouseLeave:  true,
                closeOnFocusOut:    true,
                addKeyboardAction:  true,
                addIdToParameter:   true    
            }
        };
        
        
        var selectoidObject = $(self.toId(self.defaults.selectoid));
   
        self.currentWidth = -1;

        self.dataFormat = function (element) {
            return { 
                name:  element.name, 
                value: element.value 
            };
        };
        
        self.htmlFormat = function (element) { 
            return element.name; 
        };
        
        
        $.each(self.defaults.actions, function (k, v) {
            self.defaults[k] = v;
        });
        
        self.setNewParametersBasedOnObject(object, data, initial);
        
        
        if (!selectoidObject.doesExist()) {
            throw new Error("Selectoid: no such id found: " + self.defaults.selectoid);
        }
        
        // Get Data-[] user-defined properties and set it as options
        $.each( selectoidObject.data() , function (key, value) {
            //console.log("Key", key, "Value: [", value, "]", self.defaults.selectoid);
            self.defaults[key] = value;
        });
        $.each(self.defaults.actions, function (k, v) {
            var dataActionValue = self.defaults[k.toLowerCase()];
            if (!__.isUndefined(dataActionValue)) {
                self.defaults[k] = dataActionValue; 
            }
        });
        
        
        self.generateSelectBox();
        self.generateButtonHtml();
        self.generateList();
        
        self.setInitialValues();
        
        // deactivate selectoid and focusing.
        self.turnSelectoid(-1);
        
        self.setupActions();
        
        return self.addIdToParameters();
    };
    
    Selectoid.prototype.setNewParametersBasedOnObject = function (object, data, initial) {
        
        var self = this;
        
        // Selectoid recieves an object (complex)
        if (__.isObject(object)) {
            
            
            $.extend(self.defaults, object.parameters);
            
            // Initial value
            self.defaults.initial = object.parameters.initial;
            
            // Data
            self.data = object.data;
            
            //self.width = object.widths || self.widths;
            
            // Format data accessors [name, value]
            self.dataFormat = object.dataFormat || self.dataFormat;
            
            // Format item HTML output
            self.htmlFormat = object.htmlFormat || self.htmlFormat;
        

            $.each(object.parameters, function (k, v) {
                self.defaults[k] = v;
            });

        // Selectoid recieves id and data (basic)
        }  else {

            self.data = data;
            // Initial value
            self.defaults.initial = initial;
        }
        
        //console.log("New initial:", self.defaults.initial);
        //console.log("ADD KEYBOARD???",self.defaults.addKeyboardAction);
        
    };
    Selectoid.prototype.addIdToParameters = function () {
        if (this.defaults.addIdToParameter != null) Selectoid[this.defaults.selectoid] = this;
        return this;
    };
    Selectoid.prototype.generateSelectBox = function () {
        var self = this;
        $(self.toId(self.defaults.selectoid)).append(
            "<select class='" + self.defaults.select_class + "' id='" + self.defaults.select + "'>" + 
                self.generateSelectOptions() +
            "</select>"
        );
    };
    Selectoid.prototype.generateSelectOptions = function () {
        var options = "";
        for (var i = 0, length = this.data.length; i < length; i++) {
            options += "<option value='" + this.getValue(i) +  "'>" + this.getName(i) + "</option>";    
        }
        return options;
    };
    Selectoid.prototype.getName = function (indexOrObject) {
        if ($.isNumeric(indexOrObject)) return this.dataFormat(this.data[indexOrObject]).name;
        return this.dataFormat(indexOrObject).name;
    };
    Selectoid.prototype.getValue = function (indexOrObject) {
        if ($.isNumeric(indexOrObject)) return this.dataFormat(this.data[indexOrObject]).value;
        return this.dataFormat(indexOrObject).value;
    };
    Selectoid.prototype.getDataNameByValue = function (value) {
        for (var i = 0; i < this.data.length; i++) {
            if (this.getValue(i) == value) return this.getName(i);
        }
    };
    Selectoid.prototype.getItemByValue = function (value) {
        var self = this, result;
        $.each(self.data, function (index, item) {
            if (self.dataFormat(item).value === value) {
                result = item;
                return;
            }
        });
        return result;
    };
    Selectoid.prototype.getElementWidth = function () {
        return $(this.defaults.widthElement).width() || 
            $(this.toId(this.defaults.selectoid)).closest(this.defaults.widthElement).width();
    };
    Selectoid.prototype.generateList = function () {
        var self = this,
            holder = "<ul class='" + self.defaults.holder_class + " " + self.defaults.hidden + "' id='" + self.defaults.holder + "'>";
            holder += self.generateListItems();
            holder += "</ul>";
        $(self.toId(self.defaults.selectoid)).append(holder);
    };
    Selectoid.prototype.generateListItems = function () {
        var listItems = "";
        for (var item = 0, length = (this.data.length - 1); item <= length; item++) {
            listItems += "<li class='" + this.defaults.item + "' data-name='" + this.getName(item) + "' data-value='" + this.getValue(item) + "' >" +
                        this.htmlFormat(this.data[item]) + "</li>";
        }
        return listItems;
    };
    
    Selectoid.prototype.generateButtonHtml = function (text) {
        $(this.toId(this.defaults.selectoid)).append("<button class='" + this.defaults.button_class +"' id='" + this.defaults.button + "'></button>");
    };
    
    Selectoid.prototype.generateCSS = function () {
        
        var self = this,
            widthArray = [
                {min:0,   max:250,  columns:1, secondary: false},
                {min:251, max:479,  columns:1, secondary: true },
                {min:480, max:701,  columns:2, secondary: false},
                {min:702, max:801,  columns:2, secondary: true },
                {min:802, max:960,  columns:3, secondary: false},
                {min:961, max:1120, columns:3, secondary: true },
            ], 
            widthArrayLength = widthArray.length;
        
        var resizeSelectoidDiv = function () {
            
            var object,
                moreThanMaxWidth = false,
                sameWidthCategory = false,
                width = self.getElementWidth(); 
                
            //todo: improve
            for (var i = 0; i < widthArrayLength; i++) {
                if (width >= widthArray[i].min && width <= widthArray[i].max) {
                    object = widthArray[i];
                    break;
                } else if (i+1 == widthArrayLength && width > widthArray[i].max) {
                    moreThanMaxWidth = true;
                    object = widthArray[i];
                    break;
                }
            }
            
            if (self.currentWidth >= object.min && self.currentWidth <= object.max) {
                sameWidthCategory = true;
            }
            
            if (!sameWidthCategory) {
                
                $(self.toId(self.defaults.holder)).width(object.min || "100%");
                
                if (object.secondary) {
                    $(self.toClass(self.defaults.secondary)).show();
                } else {
                    $(self.toClass(self.defaults.secondary)).hide();
                }
                
                $(self.toId(self.defaults.holder)).css({
                    "column-count": object.columns,
                    "-moz-column-count": object.columns,
                    "-webkit-column-count": object.columns
                });                
            }
            
            self.currentWidth = width;
            
        };
        
        if (self.defaults.responsive) {
            $(window).resize(function () { 
                resizeSelectoidDiv(); 
            });
        }
        
        resizeSelectoidDiv();
    };
    
    Selectoid.prototype.changeData = function (newData, newInitial) {
    
        var self = this,
            newOptions, newListItems;
            
        if (__.isObject(newData)) {
            self.setNewParametersBasedOnObject(newData);
        } else {
            self.setNewParametersBasedOnObject("", newData, newInitial);
        }
            
        newOptions = self.generateSelectOptions();
        newListItems = self.generateListItems();
        
        $(self.toId(self.defaults.select))
            // clear select options // repopulate select
            .find('option').remove().end().append(newOptions);
            
        $(self.toId(self.defaults.holder))
            // clear list               // repopulate list
            .find('li').remove().end().append(newListItems);
            
        // select new initial data
        this.setInitialValues();
        
        this.setupActions();
    };
    
    
    Selectoid.prototype.setButtonText = function (text) {
        text = text || this.getCurrentText();
        $(this.toId(this.defaults.button)).html(text + "&nbsp;<div class='arrow-down float-right'></div>");
    };
    
    /* ACTIONS */
    Selectoid.prototype.setupActions = function () {
        
        // Unbind all actions from previous elements
        //todo: improve, make a stack
        $(this.toId(this.defaults.selectoid)).find("*").off();
        
        this.setSelectoidDefaultActions();
        
        this.setButtonActions();
        this.setListActions();
        
        this.generateCSS();
        
        this.defaults.focusOutActions = [];
        this.defaults.mouseLeaveActions = [];
        
        this.setMouseLeaveActions();
        this.setFocusOutActions();
        if (this.defaults.addKeyboardAction) this.setKeyboardAction();
    };
    
    Selectoid.prototype.afterItemWasSelected = function () {
        var self = this;
        setTimeout(function () {
            self.turnSelectoid(-1);
            $(self.toId(self.defaults.button)).focus();
        }, 100);
        
    };
    
    Selectoid.prototype.turnFocus = function (value) {
        var self = this;
        $(self.toId(self.defaults.holder) + ", " + self.toId(self.defaults.select)).attr({
            tabIndex: value, tabindex: value 
        });
    };
        
    Selectoid.prototype.turnSelectoid = function (value) {
        var self = this;
            
        if (value < 0) {
            
            //console.log('turning selectoid off')
            
            $(self.toId(self.defaults.holder)).addClass(self.defaults.hidden);
            self.setCurrentValues(self.getCurrentValue());
            self.turnFocus(-1);
            
        } else {
            
            //console.log('turning selectoid on: focus from button -> holder')
            
            self.turnFocus(value);
            $(self.toId(self.defaults.holder)).removeClass(self.defaults.hidden);
            setTimeout(function() {
                $(self.toId(self.defaults.button)).focusout();
                $(self.toId(self.defaults.holder)).focus();
            }, 100);
        }
    };
    
    Selectoid.prototype.setButtonActions = function () {
        var self = this;
        
        $(self.toId(self.defaults.button)).on("click keyup", function (e) {
            
            if (!e.keyCode && !$(self.toId(self.defaults.holder)).hasClass(self.defaults.hidden)) {
                //console.log('closing')
                self.turnSelectoid(-1);
                return false;
            }
            
            if (!e.keyCode || (e.keyCode && [13, 37, 38, 39, 40].indexOf(e.keyCode) > -1)) {
                //console.log('opening')
                self.turnSelectoid(0);
            }
        });
    };
    
    Selectoid.prototype.setListActions = function () {
        
        var self = this,
            listId = self.toId(self.defaults.holder),
            itemsClass = self.toClass(self.defaults.item),
            selectedDivItem = itemsClass + self.toClass(self.defaults.selected);
            
        $(self.toId(self.defaults.holder) + " " + itemsClass).on("click", function () {
            
            //console.log("click on item in list")
            
            $(listId + " " + selectedDivItem).removeClass(self.defaults.selected);
            
            $(this).addClass(self.defaults.selected);
            
            var data = $(this).data();
            
            self.setCurrentValues(data.value, data.name);
            self.setButtonText();
            
            self.afterItemWasSelected();
            
        }).mouseover(function () {
            
            //console.log("mouseover item in list- add 'selected' class")
            
            $(this).addClass(self.defaults.selected);
        
        }).mouseleave(function () {
        
            //console.log("mouseleft item in list - remove 'selected' class")
            
            if (self.getCurrentValue() != $(this).data().value) {
                $(this).removeClass(self.defaults.selected);
            }
        
        });
    };
    
    Selectoid.prototype.setCurrentValues = function (value, name) {
        $(this.toId(this.defaults.select)).val(value);
        this.currentValue = value;
        this.currentText = name || this.getDataNameByValue(value);
    };
    
    Selectoid.prototype.getCurrentValue = function () { return this.currentValue; };
    
    Selectoid.prototype.getCurrentText = function () { return this.currentText; };
    
    
    Selectoid.prototype.setMouseLeaveActions = function () {
        
        //console.log('close selectoid on mouse out:', "$('" + this.toId(this.defaults.button) + "')");
        
        var self = this,
            defaultAction = function () {
                
                $(self.toId(self.defaults.holder)).on("mouseleave", function () {
                    
                    self.turnSelectoid(-1);
                    
                }); 
            },
            mouseLeaveActions = self.defaults.mouseLeaveActions;
        
        if (self.defaults.closeOnMouseLeave) mouseLeaveActions.push(defaultAction);
        
        $.each(mouseLeaveActions, function (i, func) { func(); });
        
    };
    
    Selectoid.prototype.setFocusOutActions = function () {
        
        var self = this,
            defaultAction = function () {
                
                $(self.toId(self.defaults.select)).on("focusout", function () {
                    
                    //console.log("focusing out of list")
                    
                    setTimeout(function () {
                        self.turnSelectoid(-1);
                    }, 100);
                    
                });
            },
            focusOutActions = self.defaults.focusOutActions;
            
        if (self.defaults.closeOnFocusOut) focusOutActions.push(defaultAction);
        
        $.each(focusOutActions, function (i, func) { func(); });
        
    };
    
    
    Selectoid.prototype.setSelectoidDefaultActions = function () {
        
        var self = this;

        $(self.toId(self.defaults.holder)).on("focusin", function () {
            
            //console.log("focused on list, focusing on select")
            setTimeout(function () {
                $(self.toId(self.defaults.select)).focus();
            }, 100);
        });
        
      
    };

    Selectoid.prototype.setKeyboardAction = function () {
        
        var self = this,
            previousKeyPressedItemValue = self.getCurrentValue(),
            newKeyPressedItemValue = "";

        //console.log('setting keyboard actions');
        
        function changeItemIfValueDiffer (value) {
            if (previousKeyPressedItemValue != value) {
                previousKeyPressedItemValue = value;
                self.changeSelectedItem(value);
            }
        }
        
        // KEY DOWN
        $(self.toId(self.defaults.select))
            .keydown(function (event) {
                
                //console.log('key down on select');
                
                if ([37, 38, 39, 40].indexOf(event.which) > -1) {
                    changeItemIfValueDiffer($(this).val());
                } else if (event.which == 27) {
                    self.turnSelectoid(-1);
                }
            })
            .keyup(function (event) {
                
                //console.log('key up on select');
                
                if (event.which == 13) {
                    self.setCurrentValues($(this).val());
                    self.setButtonText();
                    
                    self.afterItemWasSelected();
                    
                } else {
                    changeItemIfValueDiffer($(this).val()); 
                }
        });
        
    };
    
    
    Selectoid.prototype.setInitialValues = function () {
        
        var self = this,
            initialItem = {};
        
        // Select user-defined initial item (or the default one)
        $.each(self.data, function (index, item) {
            if (self.getValue(index) === self.getCurrentValue()) initialItem = item;
            // user Defined
            if (self.getValue(index) === self.defaults.initial) { 
                initialItem = item; return false; 
            }
        });
        
        if ($.isEmptyObject(initialItem)) {
            initialItem = self.data[0]; 
        }
        
        //console.log('Initial value:', initialItem);
        
        // Set text for the Button
        self.setButtonText(initialItem.name);
        
        // Set initial value in select box
        self.setCurrentValues(self.defaults.initial);
        
        self.changeSelectedItem();
    };
    
    Selectoid.prototype.removeSelectedItemClass = function () {
        $(this.toId(this.defaults.holder) + " " + 
            this.toClass(this.defaults.item) + this.toClass(this.defaults.selected))
            .removeClass(this.defaults.selected);
    };
    
    Selectoid.prototype.addSelectedItemClass = function (value) {
        var self = this,
            newValue = value || self.getCurrentValue();
            
        $(self.toId(self.defaults.holder) + " " +
            self.toClass(this.defaults.item) + "[data-value=" + newValue + "]")
            .addClass(self.defaults.selected);
    };
    
    Selectoid.prototype.changeSelectedItem = function (value) {
        this.removeSelectedItemClass();
        this.addSelectedItemClass(value);
    };
    
    // toClass, toId helpers
    $.each([{name: "Class" , value: "."},{name: "Id", value: "#"}], function (index, item) {
        Selectoid.prototype["to" + item.name] = function (element) {
            return item.value + element; 
        };
    });
    
    root.Selectoid = Selectoid;

}).call(this, jQuery);
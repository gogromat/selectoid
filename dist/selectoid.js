/* global jQuery */

(function ($) {
  
    // Tells if jQuery's wrapped object is found in DOM
    $.fn.doesExist = function () { 
        return $(this).length > 0;
    };
    
    var toType = function(obj) {
        return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
    };
    
    var getElementId = (function () {
        var incrementingId = 0;
        return function (element) {
            if (!element.id) element.id = "selectoid_" + incrementingId++;
            return element.id;
        };
    }());
    
    var root = this, 
        Selectoid;
        
    Selectoid = function (object, data, initial) {
        
        var self = this;
            
        
        // Set Selectoid id (main div) as early as possible
        if (toType(object) === "object") {
            if (object.object instanceof jQuery) self.object = object.object;
            else self.object = $(object.object);
        } else {
            if (object instanceof jQuery) self.object = object;
            else self.object = $(object);
        }
        
        //self.objectId = ( (toType(object) === "object" ? object.object.substring(1) : object.substr(1) ) );   
        self.objectId = self.object.attr("id") || getElementId(self.object.get(0));

     
        // CLASSES
        self.defaults = {
            
            select_class: "selectoid_select",
            button_class: "selectoid_button",
            holder_class: "selectoid_holder",
            
            selectoid:    self.objectId,
            
            select:       self.objectId + "_select",
            holder:       self.objectId + "_holder",
            button:       self.objectId + "_button",
            
            itemHolder:   "itemHolder",
            item:         "item",
            selected:     "selected",
            hidden:       "hidden",
            
            secondary:    "secondary",
            
            widthElement: "body",
            
            responsive: true,
            closeOnMouseLeave: true,
            closeOnFocusOut: true,
            addIdToParameter: true
        };
   
        self.currentWidth = 0;

        self.dataFormat = function (element) {
            return { "name":  element.name, "value": element.value };
        };
        self.htmlFormat = function (element) { 
            return element.name; 
        };

        self.setNewParametersBasedOnObject(object, data, initial);
        
        var selectoidObject = $(self.toId(self.defaults.selectoid));
        
        if (!selectoidObject.doesExist()) {
            throw new Error("Selectoid: no such id found: " + self.defaults.selectoid);
        }
        
        // Get Data-[] user-defined properties
        $.each( selectoidObject.data() , function (key, value) {
           self.defaults[key] = value;
        });
        
        self.generateSelectBox();
        self.generateButtonHtml();
        self.generateList();
        
        self.setInitialValues();
        
        self.setupActions();
        
        return self.addIdToParameters();
    };
    Selectoid.prototype.setNewParametersBasedOnObject = function (object, data, initial) {
        var self = this;
        // Selectoid recieves an object (complex)
        if (toType(object) === "object") {
            
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
        
            // Setup mouseleave/focusout functions
            // todo : beautify
            self.defaults.closeOnMouseLeave = object.parameters.closeOnMouseLeave;
            self.defaults.closeOnFocusOut = object.parameters.closeOnFocusOut;
            self.defaults.addIdToParameter = object.parameters.addIdToParameter;
            self.defaults.closeOnMouseLeave = (typeof(self.defaults.closeOnMouseLeave) != "undefined" ? self.defaults.closeOnMouseLeave : true);
            self.defaults.closeOnFocusOut   = (typeof(self.defaults.closeOnFocusOut)   != "undefined" ? self.defaults.closeOnFocusOut : true);
            self.defaults.addIdToParameter = (typeof(self.defaults.closeOnMouseLeave) != "undefined" ? self.defaults.closeOnMouseLeave : true);
        // Selectoid recieves id and data (basic)
        }  else {
            self.data = data;
            // Initial value
            self.defaults.initial = initial;
        }        
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
        var element = this.defaults.widthElement;
        if ($.trim(element)[0] === "#" || $.trim(element) === "body") return $(element).width(); // if it is an id or body
        return $(this.toId(this.defaults.selectoid)).closest(element).width();
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
            listItems += "<li class='" + this.defaults.item + "' data-value=" + this.getValue(item) + ">" +
                        this.htmlFormat(this.data[item]) + "</li>";
        }
        return listItems;
    };
    Selectoid.prototype.generateButtonHtml = function (text) {
        $(this.toId(this.defaults.selectoid)).append("<button class='" + this.defaults.button_class +"' id='" + this.defaults.button + "'></button>");
    };
    Selectoid.prototype.generateCSS = function () {
        
        var self = this,
            selectoidElement = $(self.toId(self.defaults.selectoid)),
            widthArray = [
                {min:0,   max:250,  columns:1, secondary:false},
                {min:251, max:479,  columns:1, secondary:true },
                {min:480, max:701,  columns:2, secondary:false},
                {min:702, max:801,  columns:2, secondary:true },
                {min:802, max:960,  columns:3, secondary:false},
                {min:961, max:1120, columns:3, secondary:true },
            ], 
            widthArrayLength = widthArray.length;
        
        var resizeSelectoidDiv = function () {
            
            var object,
                moreThanMaxWidth = false,
                sameWidthCategory = false;
                
            var width = self.getElementWidth(); 
                
            //todo: improve
            for (var i = 0; i < widthArrayLength; i++) {
                if (width >= widthArray[i].min && width <= widthArray[i].max) {
                    object = widthArray[i];
                } else if (i+1 == widthArrayLength && width > widthArray[i].max) {
                    moreThanMaxWidth = true;
                    object = widthArray[i];
                }
            }
            
            if (self.currentWidth >= object.min && self.currentWidth <= object.max) {
                sameWidthCategory = true;
            }
            
            if (!sameWidthCategory) {
                $(self.toId(self.defaults.holder)).width(object.min || "100%");
                
                if (object.secondary)
                    $(self.toClass(self.defaults.secondary)).show();
                else
                    $(self.toClass(self.defaults.secondary)).hide();
                    
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
            //oldInitial = self.defaults.initial,
            newOptions, newListItems;
            
        if (toType(newData) === "object") {
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
        $(this.toId(this.defaults.button)).html(text + "&nbsp;<div class='arrow-down float-right'></div>");
    };
    
    /* ACTIONS */
    Selectoid.prototype.setupActions = function () {
        
        // Unbind all actions from previous elements
        $(this.toId(this.defaults.selectoid)).find("*").off();
        
        this.setButtonActions();
        this.setDivActions();
        
        this.generateCSS();
        
        if (this.defaults.closeOnMouseLeave) this.setDivMouseLeaveAction();
        if (this.defaults.closeOnFocusOut) this.setDivFocusOutAction();
    };
    
    Selectoid.prototype.setButtonActions = function () {
        var self = this;
        $(self.toId(self.defaults.button)).on("click", function () {
            $(self.toId(self.defaults.holder)).removeClass(self.defaults.hidden).focus();
        });
    };
    Selectoid.prototype.setDivActions = function () {
        
        var self = this,
            divId     = self.toId(self.defaults.holder),
            itemsClass   = self.toClass(self.defaults.item),
            selectedDivItem = itemsClass + self.toClass(self.defaults.selected);
            
        $(self.toId(self.defaults.selectoid) + " " + itemsClass).on("click", function () {
            
            $(divId + " " + selectedDivItem).removeClass(self.defaults.selected);
            $(this).addClass(self.defaults.selected);
            
            var value = $(this).data("value"),
                item = self.getItemByValue(value);
            
            self.setButtonText(self.getName(item));
            
            $(self.toId(self.defaults.select)).val(value);
            $(self.toClass(self.defaults.holder_class)).addClass(self.defaults.hidden);
            
        });
    };
    Selectoid.prototype.setDivMouseLeaveAction = function () {
        
        var holderId = this.toId(this.defaults.holder);
            
        $(holderId).on("mouseleave", function () { 
            $(this).addClass("hidden"); 
        });
      
    };
    Selectoid.prototype.setDivFocusOutAction = function () {
        
        var holderId = this.toId(this.defaults.holder);
            
        document.querySelector(holderId).tabIndex = 1;
            
        $(holderId).on("focusout", function () { 
            $(this).addClass("hidden"); 
        });
    };
    
    Selectoid.prototype.setInitialValues = function () {
        
        var self = this,
            selectBox  = $(self.toId(self.defaults.select)),
            itemsClass = self.toClass(self.defaults.item),
            selectedDivItem = itemsClass + self.toClass(self.defaults.selected),
            userDefinedItem, 
            initialItem,
            selectedSelectBoxVal = selectBox.val();
        
        // Select user-defined initial item (or the default one)
        $.each(self.data, function (index, item) {
            if (self.getValue(index) === selectedSelectBoxVal) initialItem = item;
            if (self.getValue(index) === self.defaults.initial) userDefinedItem = item;
        });
        
        if (!userDefinedItem) self.defaults.initial = selectedSelectBoxVal;
        userDefinedItem = userDefinedItem || initialItem;
        
        // Set text for the Button
        self.setButtonText(userDefinedItem.name);
        
        // Set initial value in select box
        selectBox.val(self.defaults.initial);
        
        // Remove previously selected item
        $(self.toId(self.defaults.holder) + " " + selectedDivItem).removeClass(self.defaults.selected);
        
        // Select current item in the list
        $.each($(self.toId(self.defaults.holder) + " " + self.toClass(self.defaults.item)), function () {
            if ($(this).data("value") === selectBox.val())  $(this).addClass(self.defaults.selected);
        });
    };
    
    // toClass, toId helpers
    $.each([{name: "Class" , value: "."},{name: "Id", value: "#"}], function (index, item) {
        Selectoid.prototype["to" + item.name] = function (element) {
            return item.value + element; 
        };
    });
    
    root.Selectoid = Selectoid;

}).call(this, jQuery);
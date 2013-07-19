/* global jQuery */

(function ($) {
    
    var root = this, 
        Selectoid;
    
    var toType = function(obj) {
        return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
    };
        
    Selectoid = function (object, data, initial) {
        
        var self = this;
        
        // Set Selectoid id (main div) as early as possible
        self.objectId = ( (toType(object) === "object" ? object.object.substring(1) : object.substr(1) ) );
     
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
            hidden:       "hidden"
            
        };
   

        self.dataFormat = function (element) {
            return { "name":  element.name, "value": element.value };
        };
        self.htmlFormat = function (element) { 
            return element.name; 
        };

        // Selectoid recieves an object (complex)
        if (toType(object) === "object") {
            
            $.extend(self.classes, object.parameters.classes);
            $.extend(self.ids, object.parameters.ids);
            
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
            self.closeOnMouseLeave = (typeof(object.parameters.mouseLeaveClose) != "undefined" ? object.parameters.mouseLeaveClose : true);
            self.closeOnFocusOut   = (typeof(object.parameters.focusOutClose) != "undefined" ? object.parameters.focusOutClose : true);         
        
        // Selectoid recieves id and data (basic)
        }  else {
            
            self.closeOnMouseLeave = true;
            self.closeOnFocusOut = true;
            self.data = data;
            
            // Initial value
            self.defaults.initial = initial;
        }
        
        // Get Data-[] user-defined properties
        $.each( $(self.toId(self.defaults.selectoid)).data() , function (key, value) {
           self.defaults[key] = value;
        });
        
        
        
        self.generateSelectBox();
        self.generateButton();
        self.generateDivBox();

        self.setInitialValues();
        self.setButtonActions();
        self.setDivActions();
        
        if (self.closeOnMouseLeave) self.setDivMouseLeaveAction();
        if (self.closeOnFocusOut) self.setDivFocusOutAction();
        
        
        // getSelectId, getButtonId, getDivId
        /*
        $.each(Object.keys(self.ids), function (index, item) {
            Selectoid.prototype["get" + item.charAt(0).toUpperCase() + item.substring(1) + "Id"] = function () {
                return self.ids[item];
            };
        });
        // getSelectClass, getButtonClass, getDivClass
        $.each(Object.keys(self.classes), function (index, item) {
            Selectoid.prototype["get" + item.charAt(0).toUpperCase() + item.substring(1) + "Class"] = function () {
                return self.ids[item];
            };
        });*/
    
    };
    Selectoid.prototype.generateSelectBox = function () {
        
        var self = this,
            options = "";
        
        for (var i = 0, length = self.data.length; i < length; i++) {
            options += "<option value='" + self.getValue(i) +  "'>" + 
                           self.getName(i) + 
                       "</option>";    
        }
        
        $(self.toId(self.defaults.selectoid)).append(
            "<select class='" + self.defaults.select_class + "' id='" + self.defaults.select + "'>" + 
                options +
            "</select>"
        );
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
    Selectoid.prototype.getWindowWidth = function () {
        return $(window).width();
    };
    Selectoid.prototype.generateDivBox = function () {
        
        var self = this,
            windowWidth = self.getWindowWidth(),
            itemHolderDivs = 0,
            totalItems = self.data.length;
        
        itemHolderDivs = (totalItems < 6 ? 1 : 3);
        
        // Very few items
        if (itemHolderDivs > totalItems) itemHolderDivs = totalItems; 
        
        var itemsPerHolders = Math.ceil(totalItems/itemHolderDivs),
            currentElement = 0,
            endDiv = "</div>";
        
        var div = "<div class='" + self.defaults.holder_class + " " + self.defaults.hidden + "' id='" + self.defaults.holder + "'>";
        
            // Item Holder Divs
            for (var iHolder = 0; iHolder < itemHolderDivs; iHolder ++ ) {
                
                div += "<div class='" + self.defaults.itemHolder + "'>";
                
                var top = (itemsPerHolders*(iHolder+1))-1,
                    bottom = ((top-itemsPerHolders) > 0 ? (top-itemsPerHolders) + 1 : 0);
                            
                // Item Divs
                for (var item = bottom; item <= top; item++) {
                
                    if (currentElement >= totalItems) break;
                    
                    div += "<div class='" + this.defaults.item + "' data-value=" + self.getValue(currentElement) + ">" + 
                                    // user-defined format of the data
                                self.htmlFormat(self.data[currentElement]) + 
                            endDiv;
                    currentElement++;
                }
                div += endDiv;
            }                    
        div += endDiv;
        
        $(self.toId(self.defaults.selectoid)).append(div);
    };
    Selectoid.prototype.generateButton = function (text) {
        $(this.toId(this.defaults.selectoid)).append("<button class='" + this.defaults.button_class +"' id='" + this.defaults.button + "'></button>");
    };
    Selectoid.prototype.setButtonText = function (text) {
        $(this.toId(this.defaults.button)).html(text + "&nbsp;<div class='arrow-down float-right'></div>");
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
                item = self.getItemByValue( value );
            
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
            userDefinedItem, initialItem,
            initialSelectBoxVal = selectBox.val();
        
        // Select user-defined initial item (or the default one)
        $.each(self.data, function (index, item) {
            if (self.getValue(index) === initialSelectBoxVal) initialItem = item;
            if (self.getValue(index) === self.defaults.initial) userDefinedItem = item;
        });
        
        if (!userDefinedItem) self.defaults.initial = initialSelectBoxVal;
        userDefinedItem = userDefinedItem || initialItem;
        
        self.setButtonText(userDefinedItem.name);
        selectBox.val(self.defaults.initial);
        
        // Remove previously selected item
        $(self.toId(self.defaults.holder) + " " + selectedDivItem).removeClass(self.defaults.selected);
        
        // Select current item
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
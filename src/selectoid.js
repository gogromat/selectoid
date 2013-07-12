/* global jQuery */

(function ($) {
    
    var root = this, 
        Selectoid;
    
    var toType = function(obj) {
        return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
    };
        
    Selectoid = function (object, data) {
        
        var self = this;
        
        // Set Selectoid id (main div) as early as possible
        self.setObjectId( (toType(object) === "object" ? object.object.substring(1) : object.substr(1) ) );
            
        // CLASSES
        self.classes = {
            "select":     "selectoid_select",
            "button":     "selectoid_button",
            "holder":     "selectoid_holder",
            "itemHolder": "itemHolder",
            "item":       "item",
            "selected":   "selected",
            "hidden":     "hidden"
        };
        
        // IDS
        self.ids = {
            "selectoid": self.getObjectId(),
            "select":    self.getObjectId() + "_select",
            "holder":    self.getObjectId() + "_holder",
            "button":    self.getObjectId() + "_button"
        };
        
        // Item Holder Widths
        self.widths = [
            {min:  0, max:480,      holders:1},
            {min:481, max:800,      holders:2},
            {min:801, max:Infinity, holders:3}
        ];
        
        
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
            self.initial = object.parameters.initial;
            
            // Data
            self.data = object.data;
            
            self.width = object.widths || self.widths;
            
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
        }
        
        self.generateSelectBox();
        self.generateDivBox();
        self.generateButton();

        self.setInitialValues();
        self.setButtonActions();
        self.setDivActions();
        
        if (self.closeOnMouseLeave) self.setDivMouseLeaveAction();
        if (self.closeOnFocusOut) self.setDivFocusOutAction();
        
        
        // getSelectId, getButtonId, getDivId
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
        });
    
    };
    Selectoid.prototype.setObjectId = function (id) {
        this.objectId = id;
    };
    Selectoid.prototype.getObjectId = function (id) {
        return this.objectId;
    };
    Selectoid.prototype.generateSelectBox = function () {
        
        var self = this,
            options = "";
        
        for (var i=0, length=self.data.length; i < length; i++) {
            options += "<option value='" + self.getValue(i) +  "'>" + 
                           self.getName(i) + 
                       "</option>";    
        }
        
        $(self.toId(self.ids.selectoid)).append(
            "<select class='" + self.classes.select + "' id='" + self.ids.select + "'>" + 
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
            
        $.each(self.widths, function (index, widthItem) {
            if (windowWidth >= widthItem.min && windowWidth <= widthItem.max) {
                itemHolderDivs = widthItem.holders;
            }
        });
        // Very few items
        if (itemHolderDivs > totalItems) itemHolderDivs = totalItems; 
        
        var itemsPerHolders = Math.ceil(totalItems/itemHolderDivs),
            currentElement = 0,
            endDiv = "</div>";
        
        var div = "<div class='" + self.classes.holder + " " + self.classes.hidden + "' id='" + self.ids.holder + "'>";
        
            // Item Holder Divs
            for (var iHolder = 0; iHolder < itemHolderDivs; iHolder ++ ) {
                
                div += "<div class='" + self.classes.itemHolder + "'>";
                
                var top = (itemsPerHolders*(iHolder+1))-1,
                    bottom = ((top-itemsPerHolders) > 0 ? (top-itemsPerHolders)+1 : 0);
                            
                // Item Divs
                for (var item = bottom; item <= top; item++) {
                
                    if (currentElement >= totalItems) break;
                    
                    div += "<div class='" + this.classes.item + "' data-value=" + self.getValue(currentElement) + ">" + 
                                    // user-defined format of the data
                                self.htmlFormat(self.data[currentElement]) + 
                            endDiv;
                    currentElement++;
                }
                div += endDiv;
            }                    
        div += endDiv;
        
        $(self.toId(self.ids.selectoid)).append(div);
    };
    Selectoid.prototype.generateButton = function (text) {
        $(this.toId(this.ids.selectoid)).append("<button class='" + this.classes.button +"' id='" + this.ids.button + "'></button>");
    };
    Selectoid.prototype.setButtonText = function (text) {
        $(this.toId(this.ids.button)).html(text + "&nbsp;<div class='arrow-down float-right'></div>");
    };
    Selectoid.prototype.setButtonActions = function () {
        var self = this;
        $(self.toId(self.ids.button)).on("click", function () {
            $(self.toId(self.ids.holder)).removeClass(self.classes.hidden).focus();
        });
    };
    Selectoid.prototype.setDivActions = function () {
        
        var self = this,
            divId     = self.toId(self.ids.holder),
            itemsClass   = self.toClass(self.classes.item),
            selectedDivItem = itemsClass + self.toClass(self.classes.selected);
            
        $(self.toId(self.ids.selectoid) + " " + itemsClass).on("click", function () {
            
            $(divId + " " + selectedDivItem).removeClass(self.classes.selected);
            $(this).addClass(self.classes.selected);
            
            var value = $(this).data("value"),
                item = self.getItemByValue( value );
            
            self.setButtonText(self.getName(item));
            
            $(self.toId(self.ids.select)).val(value);
            $(self.toClass(self.classes.holder)).addClass(self.classes.hidden);
            
        });
    };
    Selectoid.prototype.setDivMouseLeaveAction = function () {
        
        var holderId = this.toId(this.ids.holder);
            
        $(holderId).on("mouseleave", function () { 
            $(this).addClass("hidden"); 
        });
      
    };
    Selectoid.prototype.setDivFocusOutAction = function () {
        
        var holderId = this.toId(this.ids.holder);
            
        document.querySelector(holderId).tabIndex = 1;
            
        $(holderId).on("focusout", function () { 
            $(this).addClass("hidden"); 
        });
    };
    
    Selectoid.prototype.setInitialValues = function () {
        
        var self = this,
            selectBox  = $(self.toId(self.ids.select)),
            itemsClass = self.toClass(self.classes.item),
            selectedDivItem = itemsClass + self.toClass(self.classes.selected);
        
        self.initial = self.initial || selectBox.val();
        
        // Select user-defined initial item (or the default one)
        if (self.initial) {
            var userDefinedItem;
            $.each(self.data, function (index, item) {
                if (self.getValue(index) === self.initial) userDefinedItem = item;
            });
            if (userDefinedItem) {
                self.setButtonText(userDefinedItem.name);
                selectBox.val(self.initial);
            }
        }
        
        // Remove previously selected items
        $(self.toId(self.ids.holder) + " " + selectedDivItem).removeClass(self.classes.selected);
        
        // Select current item
        $.each($(self.toId(self.ids.holder) + " " + self.toClass(self.classes.item)), function (item) {
            if ($(this).data("value") === selectBox.val()) {
                $(this).addClass(self.classes.selected);
            }
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
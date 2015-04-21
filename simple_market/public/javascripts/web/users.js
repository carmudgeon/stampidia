/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


(function ($) {
    var User = Backbone.Model.extend({
        defaults: {
            nombre: '',
            correo: '',
            password: ''
        },
        idAttribute: "id",
        urlRoot: 'http://localhost:9000/users'
    });
    var UserList = Backbone.Collection.extend({
        model: User,
        url: 'http://localhost:9000/users'
    });
    var Compra = Backbone.Model.extend({
        defaults: {
            nombre: '',
            valor: ''
        },
        idAttribute: "id",
        urlRoot: 'http://localhost:9000/purchases'
    });
    var CompraItemUser = Backbone.Model.extend({
        initialize: function(models,options) {
            this.url = 'http://localhost:9000/users/'+options.id +'/purchases';
        },
        defaults: {
            nombre: '',
            valor: ''
        },
        idAttribute: "id"
    });
    var PurchaseList = Backbone.Collection.extend({
        initialize: function(models,options) {
            this.url = 'http://localhost:9000/users/'+options.id +'/purchases';
            this.userIn= options.id;
        },
        model: Compra
        //,
        //url: 'http://localhost:9000/users/'+this.id +'/purchases'
    });
    
    //------- Vista UserList--------------//
    var UserListView = Backbone.View.extend({
//ID del elemento html donde se insertara el codigo
        el: '#content',
//Eventos que se deben manejar
        events: {
            "click button.user-delete-btn": "deleteUser",
            "click button.user-edit-btn": "editUser",
            "click #new_user": "newUser",
            "click #car_items": "carItems"
        },
//Crea la visra formView para un usuario nuevo
        newUser: function (e) {
            formView.model = new User();
            formView.render();
        },
//Crea la visra formView para un usuario nuevo
        carItems: function (e) {
            var id = $(e.currentTarget).data("id");
            var userPurchasesListView;
            var purchaseCollection = new PurchaseList([], { id: id });
            userPurchasesListView  = new UserPurchasesListView({collection:purchaseCollection});
        },        
//Crea la visra formView para un usuario seleccionado
        editUser: function (e) {
            var id = $(e.currentTarget).data("id");
            var user = this.collection.get(id);
            formView.model = user;
            formView.render();
        },
//Borra un usuario dado, el método destroy realiza la invocación al 
//servicio REST DELETE en la URL dada en el modelo
        deleteUser: function (e) {
            var id = $(e.currentTarget).data("id");
            var user = this.collection.get(id);
            user.destroy();
            this.render();
        },
        initialize: function () {
            _.bindAll(this, 'render', 'draw', 'deleteUser', 'editUser'); // fixes loss of context for 'this' within methods
            this.render();
        },
//Recupera la lista de usuarios y genera y agrega el html a la
//página, el método fetch invoca el servicio REST GET
        render: function () {
            that = this;
            this.collection.fetch({success: function () {
                    that.draw();
                }});
        },
        draw: function () {
            that = this;
            $.get("/assets/views/user/listTemplate.html", function (data)
            {
                template = _.template(data, {
                    users: that.collection.toJSON()
                });
                $(that.el).html(template({users: that.collection.toJSON()}));
            }, 'html');
        },
    });
    //------------- Vista formulario de usuario -----------//
    var UserFormView = Backbone.View.extend({
//ID del elemento html donde se insertara el codigo
        el: '#content',
//Eventos que se deben manejar
        events: {
            "change input": "changed",
            "click #back_user": "renderList",
            "click #save_user": "saveUser",
        },
//Se encarga de actualizar el modelo cada vez que se cambia un valor en el form
        changed: function (evt) {
            var changed = evt.currentTarget;
            var value = $(evt.currentTarget).val();
            var obj = {};
            obj[changed.id] = value;
            this.model.set(obj);
        },
//Guarda el usuario con los datos dados y despliega la lista de usuarios
//El método save llama al servicio REST POST o PUT según corresponda
        saveUser: function () {
            var that = this;
            this.model.save(null, {success: function (model,
                        response) {
                    that.renderList();
                }});
        },
        initialize: function () {
            _.bindAll(this, 'render', 'changed', 'saveUser');
        },
        renderList: function () {
            listView.render();
        },
        render: function () {
            that = this;
            $.get("/assets/views/user/formTemplate.html", function (data) {
                template = _.template(data, {
                    data: that.model.toJSON()
                });
                $(that.el).html(template(that.model.toJSON()));
            }, 'html');
        },
    });
    
    //-------------- Vista items de un Usuario--------------//
     var UserPurchasesListView = Backbone.View.extend({
//ID del elemento html donde se insertara el codigo
        el: '#content',
//Eventos que se deben manejar
        events: {
                "click #new_item": "newItem",
            "click button.purchase-edit-btn": "editItem"
        },
        //Crea la visra formView para un usuario nuevo
        newItem: function (e) {
            console.log (this);
            formUserItemsView.model = new CompraItemUser([], { id: this.collection.userIn });
            formUserItemsView.render();
        },
//Borra un usuario dado, el método destroy realiza la invocación al 
//servicio REST DELETE en la URL dada en el modelo
        initialize: function () {
            _.bindAll(this, 'render', 'draw'); // fixes loss of context for 'this' within methods
            this.render();
        },
         //Crea la vista formView para un producto existente
         editItem: function (e) {
             var id = $(e.currentTarget).data("id");
             var item = this.collection.get(id);
             formUserItemsView.model = item;
             formUserItemsView.render();
         },
//Recupera la lista de usuarios y genera y agrega el html a la
//página, el método fetch invoca el servicio REST GET
        render: function () {
            that = this;
            this.collection.fetch({success: function () {
                    that.draw();
                }});
        },
        draw: function () {
            that = this;
            $.get("/assets/views/user/carItems.html", function (data)
            {
                template = _.template(data, {
                    userPurchases: that.collection.toJSON()
                });
                $(that.el).html(template({userPurchases: that.collection.toJSON()}));
            }, 'html');
        },
    });
    
    //----------- Vista formulario items usuario -----------//

    var UserItemsFormView = Backbone.View.extend({
//ID del elemento html donde se insertara el codigo
        el: '#content',
//Eventos que se deben manejar
        events: {
            "change input": "changed",
            "click #back_user": "renderList",
            "click #save_userItem": "saveUserItem"
        },
//Se encarga de actualizar el modelo cada vez que se cambia un valor en el form
        changed: function (evt) {
            var changed = evt.currentTarget;
            var value = $(evt.currentTarget).val();
            var obj = {};
            obj[changed.id] = value;
            this.model.set(obj);
        },
//Guarda el usuario con los datos dados y despliega la lista de usuarios
//El método save llama al servicio REST POST o PUT según corresponda
        saveUserItem: function () {
            var that = this;
            this.model.save(null, {success: function (model,
                        response) {
                    that.renderList();
                }});
        },
        initialize: function () {
            _.bindAll(this, 'render', 'changed', 'saveUserItem');
        },
        renderList: function () {
            listView.render();
        },
        render: function () {
            that = this;
            $.get("/assets/views/user/formItemUserTemplate.html", function (data) {
                template = _.template(data, {
                    data: that.model.toJSON()
                });
                $(that.el).html(template(that.model.toJSON()));
            }, 'html');
        },
    });
    

    //Inicializar las vistas
    var listView;
    var formView;
    var formUserItemsView;
    
    $(document).ready(function () {
        var userCollection = new UserList();
        listView = new UserListView({collection: userCollection});
        formView = new UserFormView({model: new User()});
        formUserItemsView = new UserItemsFormView({model: new Compra()});
    });

})(jQuery);
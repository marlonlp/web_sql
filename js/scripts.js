$(document).ready(function(){
    var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
    var IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction;
    var db;
    
    if (!window.indexedDB) {
        alert("Seu navegavor não suporta a API IndexedDB.");
    } else {
        bdTarefas();        
    }   

    function bdTarefas(){
        var request = indexedDB.open("Tarefas", 1);  
        request.onsuccess = function (evt) {
            db = request.result;
            $('#categoria').val('Entrada');
            var categoria = $('#categoria').val();
            $('#tarefa').attr('placeholder', "Adicionar um item em \"" + categoria + "\"");        
            listaTarefas();
            listaCategorias();
        };

        request.onerror = function (evt) {
            console.log("IndexedDB error: " + evt.target.errorCode);
        };

        request.onupgradeneeded = function (evt) {
            var storeTarefas = evt.currentTarget.result.createObjectStore("tarefas", { keyPath: "id", autoIncrement: true });
            storeTarefas.createIndex("tarefa", "tarefa", { unique: false });
            storeTarefas.createIndex("categoria", "categoria", { unique: false });
            var storeCategorias = evt.currentTarget.result.createObjectStore("categorias", { keyPath: "id", autoIncrement: true });
            storeCategorias.createIndex("categoria", "categoria", { unique: true });
        };
    }
    
    function listaTarefas() {
        var tarefas = $('.listaTarefas');
        tarefas.empty();        
        var transaction = db.transaction("tarefas", "readwrite");
        var objectStore = transaction.objectStore("tarefas");

        var req = objectStore.openCursor();
        req.onsuccess = function(evt) {  
            var cursor = evt.target.result;  
            if (cursor) {
                if(cursor.value.categoria == $('#categoria').val()) {
                    var linha  = "<li>" + cursor.value.tarefa + "<a href='#' id='" + cursor.key + "'>[ Delete ]</a></li>";
                    $('.listaTarefas').append(linha);
                }
                cursor.continue();  
            }  
        };          
    }
    
    function listaCategorias() {
        var tarefas = $('.listaCategorias');
        tarefas.empty();        
        $('.listaCategorias').append("<li id='Entrada' class='categorias ativo'>Entrada</li>");
        var transaction = db.transaction("categorias", "readwrite");
        var objectStore = transaction.objectStore("categorias");

        var req = objectStore.openCursor();
        req.onsuccess = function(evt) {  
            var cursor = evt.target.result;  
            if (cursor) {
                var linha  = "<li id='"+ cursor.value.categoria +"' class='categorias'>" + cursor.value.categoria + "<a href='" + cursor.value.categoria + "' id='"+cursor.key+"'>[ X ]</a></li>";
                $('.listaCategorias').append(linha);
                cursor.continue();  
            } else {
                $('.listaCategorias').append('<li id="nova">+ Adicionar Nova Categoria</li>');                                
            }
        };   
    }    
    
    function insereTarefa() {
        var categoria = $('#categoria').val();
        var tarefa = $("#tarefa").val();

        var transaction = db.transaction("tarefas", "readwrite");
        var objectStore = transaction.objectStore("tarefas");                    
        var request = objectStore.add({tarefa: tarefa, categoria: categoria});
        request.onsuccess = function (evt) {
            $('#tarefa').val('');
            listaTarefas(); 
        };                   
    }    
    
    function insereCategoria() {
        var categoria = $('#nova_categoria').val();

        var transaction = db.transaction("categorias", "readwrite");
        var objectStore = transaction.objectStore("categorias");                    
        var request = objectStore.add({categoria: categoria});
        request.onsuccess = function (evt) {
            $('#nova_categoria').val('');
            listaCategorias(); 
        };                   
    }        
    
    function deletaTarefa(id) {
        var transaction = db.transaction("tarefas", "readwrite");
        var store = transaction.objectStore("tarefas");
        var req = store.delete(+id);
        req.onsuccess = function(evt) {  
            listaTarefas();
        };
    }

    function deletaCategoria(id, categoria) {
        var transaction = db.transaction("categorias", "readwrite");
        var store = transaction.objectStore("categorias");
        var req = store.delete(+id);
        req.onsuccess = function(evt) {
            limpaTarefasSemCategoria(categoria);
            bdTarefas();
        };
    }
    
    function limpaTarefasSemCategoria(categoria) {
        var transaction = db.transaction("tarefas", "readwrite");
        var objectStore = transaction.objectStore("tarefas");

        var req = objectStore.openCursor();
        req.onsuccess = function(evt) {  
            var cursor = evt.target.result;  
            if (cursor) {
                if(cursor.value.categoria == categoria) {
                    var del = objectStore.delete(cursor.key);
                }
                cursor.continue();  
            }
        };           
    }

    $('#tarefa').keypress(function (e) {
        if(e.keyCode == 13) {
            insereTarefa();
        }
    });
    
    $('.listaTarefas').on('click', 'a', function(){
        var confirma = confirm('Deseja excluir esta tarefa ?')
        if(confirma) {
            deletaTarefa(this.id);
            return false;
        }
    });
    
    $('.listaCategorias').on('click', 'a', function(){
        var confirma = confirm('Deseja excluir esta categoria ?\nATENÇÃO: Esta ação excluirá todas as tarefas vinculadas a esta categoria!')
        if(confirma){
            var id = this.id;
            var categoria = $(this).parent().get(0).id;
            deletaCategoria(id, categoria);       
        }
        return false;        
    });    
    
    $('.listaCategorias').on('keypress', '#nova_categoria', function(e) {
        if(e.keyCode == 13) {
            insereCategoria();
        }
    });
    
    $('.listaCategorias').on('click', '.categorias', function(){
        $('nav li').removeClass('ativo');
        $(this).addClass('ativo');        
        $('#categoria').val('');
        var id = this.id;
        $('#categoria').val(id);
        $('#tarefa').attr('placeholder', "Adicionar um item em \"" + id + "\"");        
        listaTarefas();
    });
    
    $('.listaCategorias').on('click','#nova', function(){
        $(this).replaceWith('<li id="nova"><input type="text" name="nova_categoria" id="nova_categoria" placeholder="Adicionar nova categoria"></li>')
        $('#nova_categoria').focus();
    });
    
    $('.listaCategorias').on('blur', '#nova_categoria', function(){
        $(this).replaceWith('+ Adicionar Nova Categoria')
    });
});            
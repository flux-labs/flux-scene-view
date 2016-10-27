
function Scene(viewport, data) {
    this._treeDiv = $('#tree');
    this._scene = {};
    this._data = data;
    this._vp = viewport;
    this._layers = [];
}

function createTreeNode(entity, children) {
    var label = entity.primitive+' - ';
    if (entity.label) {
        label = label+entity.label;
    }
    label = label+' ('+entity.id+')';
    var item = {
        "text" : label,
        "state": {
            "opened" : true
        }
    };
    if (entity.id != null) {
        item.id = entity.id;
    }
    if (children != null) {
        item.children = children;
    }
    return item;
}

Scene.prototype.createGroup = function (entity) {
    var children = [];
    var group = createTreeNode(entity, children);
    for (var i=0;i<entity.children.length;i++) {
        var child = this._scene[entity.children[i]];
        if (child.primitive === 'group') {
            children.push(this.createGroup(child));
        } else if (child.primitive === 'instance') {
            children.push(this.createInstance(child));
        } else {
            children.push(createTreeNode(child));
        }
    }
    return group;
}

Scene.prototype.createInstance = function (entity) {
    return createTreeNode(entity, [createTreeNode(this._scene[entity.entity])]);
}

Scene.prototype.createLayer = function (entity) {
    var children = [];
    var layer = createTreeNode(entity, children);
    for (var i=0;i<entity.elements.length;i++) {
        var child = this._scene[entity.elements[i]];
        if (child.primitive === 'group') {
            children.push(this.createGroup(child));
        } else if (child.primitive === 'instance') {
            children.push(this.createInstance(child));
        } else {
            children.push(createTreeNode(child));
        }
    }
    return layer;
}

Scene.prototype.createTree = function (entities) {
    var data = [];
    var tree = {
        "core": {
            "data": data
        }
    };
    // everything in the scene is assumed to have properties label, id, primitive, and one of (entity, children, entities etc.)
    var i;
    for (i=0;i<entities.length;i++) {
        var entity = entities[i];
        if (entity == null || typeof entity != 'object' || !entity.primitive || !entity.id) continue;
        this._scene[entity.id] = entity;
        if (entity.primitive === 'layer') {
            this._layers.push(entity);
        }
        this._scene[entity.id] = entity;
    }
    if (this._layers.length > 0) {
        for (i=0;i<this._layers.length;i++) {
            var entity = this._layers[i];
            data.push(this.createLayer(entity));
        }
    } else {
        data.push({"text" : "Not a scene"});
    }
    this.tree = $.jstree.create(this._treeDiv,tree);

    this._treeDiv.on("changed.jstree", this.updateSelected.bind(this));
}

Scene.prototype.focus = function (obj) {
    console.log('focus!');
    this._vp.focus(this.selection);
};

Scene.prototype.updateSelected = function (e, data) {
    var _this = this;
    this._vp.setGeometryEntity(this._data).then(function(results) {
        for (var i=0;i<data.selected.length; i++) {
            results.setElementColor(data.selected[i], [1,1,0]);
        }
        _this.selection = results._sceneObjectMap[data.selected[0]];
        _this._vp.render();
    })

}

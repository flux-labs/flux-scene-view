
function Scene(viewport, data) {
    this._treeDiv = $('#tree');
    this._scene = {};
    this._data = data;
    this._vp = viewport;
    this._layers = [];
    this._objectMap = {};
    var _this = this;
    viewport.addEventListener('change', function (event) {
        if (event.event === 'select') {
            _this.onSelected(event);
        }
    });
    this._updateViewport = true;
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

Scene.prototype.setObjectMap = function (obj) {
    this._objectMap = obj;
};

Scene.prototype.focus = function (obj) {
    this._vp.focus(this.selection);
};

// when the user updates selection in viewport
Scene.prototype.onSelected = function (event) {
    this._updateViewport = false;
    this.tree.deselect_all();
    if (event.selection) {
        var keys = Object.keys(event.selection);
        for (var i=0;i<keys.length;i++) {
            var obj = event.selection[keys[i]];
            if (!obj) continue;
            var id = obj.userData.id;
            if (obj.parent && obj.parent.userData.primitive === 'instance')
                id = obj.parent.userData.id;
            this.tree.select_node(id);
        }
    }
    this._updateViewport = true;
};

// update viewport selection from tree changes
Scene.prototype.updateSelected = function (e, data) {
    if (!this._updateViewport) return;
    var selectionList = [];
    for (var i=0;i<data.selected.length; i++) {
        var id = data.selected[i];
        var obj = this._objectMap[id];
        if (!obj) continue;
        selectionList.push(obj);
    }
    this._vp.setSelection(selectionList);
    this._vp.render();
}

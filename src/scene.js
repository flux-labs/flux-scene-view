
function Scene() {
    this._treeDiv = $('#tree');
    this.scene = {};
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
    if (children != null) {
        item.children = children;
    }
    return item;
}

Scene.prototype.createGroup = function (entity) {
    var children = [];
    var group = createTreeNode(entity, children);
    for (var i=0;i<entity.children.length;i++) {
        var child = this.scene[entity.children[i]];
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
    return createTreeNode(entity, [createTreeNode(this.scene[entity.entity])]);
}

Scene.prototype.createLayer = function (entity) {
    var children = [];
    var layer = createTreeNode(entity, children);
    for (var i=0;i<entity.elements.length;i++) {
        var child = this.scene[entity.elements[i]];
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
    var layers = [];
    var i;
    for (i=0;i<entities.length;i++) {
        var entity = entities[i];
        if (entity == null || typeof entity != 'object' || !entity.primitive || !entity.id) continue;
        this.scene[entity.id] = entity;
        if (entity.primitive === 'layer') {
            layers.push(entity);
        }
        this.scene[entity.id] = entity;
    }
    if (layers.length > 0) {
        for (i=0;i<layers.length;i++) {
            var entity = layers[i];
            data.push(this.createLayer(entity));
        }
    } else {
        data.push({"text" : "Not a scene"});
    }
    this.tree = $.jstree.create(this._treeDiv,tree);
}

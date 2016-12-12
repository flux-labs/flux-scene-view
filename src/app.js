'use strict';

function FluxApp (clientKey, redirectUri, projectMenu, isProd){
    this._fluxDataSelector = new FluxDataSelector(clientKey, redirectUri, {isProd:isProd});
    this._projectMenu = projectMenu;
    this._infoDiv = document.querySelector('#info');
    this._keysMenu = document.querySelector('#keysMenu');
    this._keysMenu = document.querySelector('#keysMenu');
    this._keyButton = document.querySelector('#keyButton');
    this._loginButton = document.querySelector('#loginButton');
    // Setup Flux Data Selector
    this._fluxDataSelector.setOnInitial(this.onInit.bind(this));
    this._fluxDataSelector.setOnLogin(this.onLogin.bind(this));
    this._fluxDataSelector.setOnProjects(this.populateProjects.bind(this));
    this._fluxDataSelector.setOnKeys(this.populateKeys.bind(this));
    this._fluxDataSelector.setOnValue(this.populateValue.bind(this));
    this._fluxDataSelector.init();
    this._vpDiv = document.querySelector('#viewport');
    this.hideViewport();
}

FluxApp.prototype.login = function () {
    this._fluxDataSelector.login();
}

FluxApp.prototype.onInit = function () {
}

FluxApp.prototype.onLogin = function () {
    this._fluxDataSelector.showProjects();

}

FluxApp.prototype.selectProject = function () {
    this._fluxDataSelector.selectProject(this._projectMenu.value);
    this._dt = this._fluxDataSelector.getDataTable(this._projectMenu.value).table;
    this.vp = new FluxViewport(this._vpDiv,{
        projectId: this._projectMenu.value,
        token: this.getFluxToken(),
        selection: FluxViewport.getSelectionModes().CLICK
    });
    this.vp.setupDefaultLighting();
    this.vp.homeCamera();
    this.vp.render();
}

FluxApp.prototype.hideViewport = function () {
    this._vpDiv.classList.add('hidden');
}

FluxApp.prototype.showViewport = function () {
    this._vpDiv.classList.remove('hidden');
}

FluxApp.prototype.selectKey = function () {
    this._fluxDataSelector.selectKey(this._keysMenu.value);
    // this._dt = this._fluxDataSelector.getDataTable(this._projectMenu.value).table;
}

FluxApp.prototype.createKey = function (name, data) {
    this._dt.createCell(name, {value:data, description:FluxApp.keyDescription}).then(function (cell) {
        console.log(cell);
    });
}

FluxApp.prototype.populateProjects = function (projectPromise) {
    var _this = this;
    projectPromise.then(function (projects) {
        for (var i=projects.entities.length-1;i>=0;i--) {
            var entity = projects.entities[i];
            var option = document.createElement('option');
            _this._projectMenu.appendChild(option);
            option.value = entity.id;
            option.textContent = entity.name;
        }
        _this._loginButton.classList.add('hidden');
    });
}

FluxApp.prototype.populateKeys = function (keysPromise) {
    var _this = this;
    keysPromise.then(function (keys) {
        for (var i=0;i<keys.entities.length;i++) {
            var entity = keys.entities[i];
            var option = document.createElement('option');
            _this._keysMenu.appendChild(option);
            option.value = entity.id;
            option.textContent = entity.label;
        }
        _this._keysMenu.removeAttribute('disabled');
        _this._keyButton.removeAttribute('disabled');
    });
}

FluxApp.prototype.populateValue = function (valuePromise) {
    var _this = this;
    valuePromise.then(function (entity) {
        _this.vp.setGeometryEntity(entity.value).then(function (result) {
            var errors = result.getErrorSummary()
            if (errors) {
                console.warn('Errors for key ('+entity.label+'): '+errors);
            }
            if (!_this.tree) {
                _this.tree = new Scene(_this.vp, entity.value, _this._infoDiv, result.getObjectMap());
                _this.tree.createTree(entity.value);
            }
        });
        _this.showViewport();

    });
}

FluxApp.prototype.logout = function () {
    this._fluxDataSelector.logout();
}

FluxApp.prototype.focus = function (obj) {
    this.tree.focus(obj);
}

/**
 * Gets the flux token from it's place in cookies or localStorage.
 */
FluxApp.prototype.getFluxToken = function () {
    var fluxCredentials = JSON.parse(localStorage.getItem('fluxCredentials'));
    return fluxCredentials.fluxToken;
}

FluxApp.prototype.isViewportHidden = function () {
    var cl = this._vpDiv.classList;
    for (var i=0;i<cl.length;i++) {
        if (cl[i] === 'hidden') {
            return true;
        }
    }
    return false;
};

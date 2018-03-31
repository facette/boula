const components = {
    _components: [],

    execute(name) {
        components._components.forEach((component) => {
            if (component.hasOwnProperty(name)) {
                component[name].call(this);
            }
        });
    },

    register(component) {
        components._components.push(component);
    },
};

export default components;

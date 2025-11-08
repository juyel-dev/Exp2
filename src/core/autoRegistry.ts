// Auto-discovery system for components and features
// This system automatically registers new files in features/ and ui/ folders

interface ComponentRegistry {
  [key: string]: React.ComponentType<any>;
}

class AutoRegistry {
  private components: ComponentRegistry = {};
  private features: ComponentRegistry = {};

  registerComponent(name: string, component: React.ComponentType<any>) {
    this.components[name] = component;
  }

  registerFeature(name: string, feature: React.ComponentType<any>) {
    this.features[name] = feature;
  }

  getComponent(name: string): React.ComponentType<any> | undefined {
    return this.components[name];
  }

  getFeature(name: string): React.ComponentType<any> | undefined {
    return this.features[name];
  }

  // Auto-discovery would be implemented here in build process
}

export const registry = new AutoRegistry();

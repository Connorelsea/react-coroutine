import React, { Component } from 'react';
import isEqual from 'react/lib/shallowCompare';

function create(asyncFn, getVariables = () => ({})) {
  const componentName = asyncFn.name || asyncFn.displayName;

  return class AsyncComponent extends Component {
    static get displayName() {
      return `Coroutine(${componentName})`;
    }

    constructor(props, context) {
      super(props, context);
      this.state = { body: React.createElement('noscript'),
                     variables: getVariables(props, context) };
      this.forceUpdateHelper = this.forceUpdate.bind(this);
    }

    async forceUpdate(variables = this.state.variables) {
      const additionalProps = { forceUpdate: this.forceUpdateHelper };
      const asyncBody = asyncFn(Object.assign(additionalProps, variables, this.props));

      if (asyncBody instanceof Promise) {
        const body = await asyncBody;
        this.setState(() => ({ body, variables }));
      } else {
        const getNextBody = async () => {
          const body = await asyncBody.next();
          if (!body.done) {
            this.setState(() => ({ body: body.value, variables }));
            return getNextBody();
          }
        };

        getNextBody();
      }
    }

    componentDidMount() {
      return this.forceUpdate();
    }

    componentWillReceiveProps(nextProps) {
      return !isEqual(nextProps, this.props) && this.forceUpdate();
    }

    render() {
      return this.state.body;
    }
  }
}

export default { create };

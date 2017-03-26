import React from 'react';
import Renderer from 'react-test-renderer';
import Coroutine from '../modules/Coroutine';

describe('Coroutine', async () => {
  it('should render empty body until coroutine is resolved', async () => {
    async function render() {
      return <p>test</p>;
    }

    const TestComponent = Coroutine.create(render);
    const tree = Renderer.create(<TestComponent />);

    const initial = Renderer.create(<noscript />);
    expect(tree.toJSON()).toEqual(initial.toJSON());

    const success = await Renderer.create(<p>test</p>);
    expect(tree.toJSON()).toEqual(success.toJSON());
  });

  it('should pass initial information', async () => {
    function getVariables() {
      return { number: 13 };
    }

    async function render({ number }) {
      return <p>{ number }</p>;
    }

    const TestComponent = Coroutine.create(render, getVariables);
    const tree = Renderer.create(<TestComponent />);

    const success = await Renderer.create(<p>{13}</p>);
    expect(tree.toJSON()).toEqual(success.toJSON());
  });

  it('should render each step of async iterator', async () => {
    async function* render() {
      yield <p>Loading...</p>;
      await Promise.resolve();
      return <p>Done!</p>;
    }

    const TestComponent = Coroutine.create(render);
    const tree = await Renderer.create(<TestComponent />);

    const first = await Renderer.create(<p>Loading...</p>);
    expect(tree.toJSON()).toEqual(first.toJSON());

    const second = await Renderer.create(<p>Done!</p>);
    expect(tree.toJSON()).toEqual(second.toJSON());
  });
});

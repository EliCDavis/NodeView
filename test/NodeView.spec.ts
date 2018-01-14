import { NodeView } from '../src/NodeView';

import { expect } from 'chai';
import 'mocha';

describe('NodeView', () => {
    it('should throw an error when having a null canvas element passed in', () => {
        expect(NodeView.bind(null)).to.throws()
    });

    it('should not throw an error when given an element', () => {
        expect(NodeView.bind(document.createElement('canvas'))).is.not.null;
    })

    it('should zoom 20% and affect the scale', () => {
        const view = new NodeView(document.createElement('canvas'));
        expect(view.zoom(0.2)).to.equal(0.8) 
    })
});
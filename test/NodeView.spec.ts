import { NodeView } from '../src/NodeView';

import { expect } from 'chai';
import 'mocha';

describe('NodeView', () => {
    it('should throw an error when having a null canvas element passed in', () => {
        expect(NodeView.bind(null)).to.throw("Canvas Element Can Not Be Null!")
    });

    it('should not throw an error when given an element', () => {
        expect(NodeView.bind(document.createElement('canvas'))).is.not.null;
    })
});
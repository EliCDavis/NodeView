// MIT - Eli C Davis
import { NodeView } from '../src/NodeView';

import { assert, expect } from 'chai';
import 'mocha';

describe('NodeView', () => {
    it('should throw an error when having a null canvas element passed in', () => {
        expect(NodeView.bind(null)).to.throws();
    });

    it('should not throw an error when given an element', () => {
        expect(NodeView.bind(document.createElement('canvas'))).is.not.null;
    });

    it('should zoom 20% and affect the scale', () => {
        const view = new NodeView(document.createElement('canvas'));
        expect(view.zoom(0.2)).to.equal(0.8);
    });

    it('should be able to link two nodes and look them back up', () => {
        const view = new NodeView(document.createElement('canvas'));
        const nodeA = view.createNode();
        const nodeB = view.createNode();
        const nodeC = view.createNode();
        expect(view.linkNodes(nodeA, nodeB, "ab")).is.not.null;
        expect(view.linkNodes(nodeC, nodeB, "bc")).is.not.null;

        assert.equal(view.getLink(nodeA, nodeB).data, 'ab', 'data recieved is ab');
        assert.equal(view.getLink(nodeB, nodeA).data, 'ab', 'data recieved is ab');

        assert.equal(view.getLink(nodeC, nodeB).data, 'bc', 'data recieved is bc');
        assert.equal(view.getLink(nodeB, nodeC).data, 'bc', 'data recieved is bc');

        assert.equal(view.getLink(nodeA, nodeC), null, 'data recieved is null');
        assert.equal(view.getLink(nodeC, nodeA), null, 'data recieved is null');
    });

    it('should be able to delete a link and not be able to look it up', () => {
        const view = new NodeView(document.createElement('canvas'));
        const nodeA = view.createNode();
        const nodeB = view.createNode();
        const nodeC = view.createNode();

        view.linkNodes(nodeA, nodeB, "ab");

        assert.equal(view.getLink(nodeA, nodeB).data, 'ab', 'data recieved is ab');
        assert.equal(view.getLink(nodeB, nodeA).data, 'ab', 'data recieved is ab');

        assert.equal(view.deleteLink(nodeA, nodeB), true);

        assert.equal(view.getLink(nodeA, nodeB), null, 'data recieved to be null');
        assert.equal(view.getLink(nodeB, nodeA), null, 'data recieved to be null');

        view.linkNodes(nodeA, nodeB, "ab");
        assert.equal(view.getLink(nodeA, nodeB).data, 'ab', 'data recieved is ab');
        assert.equal(view.getLink(nodeB, nodeA).data, 'ab', 'data recieved is ab');

    });

    it('should be able to return false when deleting a link if the link did not exist', () => {
        const view = new NodeView(document.createElement('canvas'));
        const nodeA = view.createNode();
        const nodeB = view.createNode();
        assert.equal(view.deleteLink(nodeA, nodeB), false);
    });

});
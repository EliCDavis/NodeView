export { MouseState }

enum MouseState {
    
    /**
     * The user isn't trying to interact with the elemnts on the graph.
     */
    Free,
    
    /**
     * The user is currentely dragging something.
     */
    Dragging,

    /**
     * The user has clicked down on a node but hasn't moved it yet.
     */
    Hold
}
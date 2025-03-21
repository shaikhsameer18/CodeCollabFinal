import { EditorView, Decoration, DecorationSet, ViewPlugin, ViewUpdate } from '@codemirror/view';
import { StateField, StateEffect, RangeSetBuilder } from '@codemirror/state';
import { syntaxTree } from "@codemirror/language";

// Define the TODO pattern (modify as needed to support different comment styles)
const TODO_REGEX = /\b(TODO|FIXME|BUG|HACK|XXX|NOTE)(:|\s)\s*(.+?)\b/g;

// Effect to update todo items
const addTodoEffect = StateEffect.define<{from: number, to: number}>();
const removeTodoMarkEffect = StateEffect.define<null>();

// Create decorations for TODO comments
const todoMark = Decoration.mark({
  class: 'cm-todo-mark',
});

// State field to track todo decorations
export const todoField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(todos, tr) {
    todos = todos.map(tr.changes);
    
    for (const e of tr.effects) {
      if (e.is(addTodoEffect)) {
        const { from, to } = e.value;
        const builder = new RangeSetBuilder<Decoration>();
        builder.add(from, to, todoMark);
        todos = todos.update({add: builder.finish()});
      } else if (e.is(removeTodoMarkEffect)) {
        todos = Decoration.none;
      }
    }
    
    return todos;
  },
  provide: (field) => EditorView.decorations.from(field),
});

// Create a view plugin to find TODOs and add highlighting
export const todoPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    
    constructor(view: EditorView) {
      this.decorations = Decoration.none;
      this.findTodos(view);
    }
    
    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.findTodos(update.view);
      }
    }
    
    findTodos(view: EditorView) {
      const builder = new RangeSetBuilder<Decoration>();
      
      // Process the visible range of the document
      for (const { from, to } of view.visibleRanges) {
        this.scanDocument(view, from, to, builder);
      }
      
      this.decorations = builder.finish();
      
      // Apply decorations
      view.dispatch({
        effects: removeTodoMarkEffect.of(null)
      });
      
      // Find and mark TODOs
      const todos: {from: number, to: number}[] = [];
      
      for (const { from, to } of view.visibleRanges) {
        const text = view.state.doc.sliceString(from, to);
        let match;
        TODO_REGEX.lastIndex = 0;
        
        while ((match = TODO_REGEX.exec(text)) !== null) {
          const matchFrom = from + match.index;
          const matchTo = matchFrom + match[0].length;
          
          todos.push({
            from: matchFrom, 
            to: matchTo
          });
        }
      }
      
      // Apply the todo effects
      if (todos.length > 0) {
        view.dispatch({
          effects: todos.map(todo => addTodoEffect.of(todo))
        });
      }
    }
    
    scanDocument(view: EditorView, from: number, to: number, builder: RangeSetBuilder<Decoration>) {
      const { state } = view;
      const text = state.doc.sliceString(from, to);
      
      let match;
      TODO_REGEX.lastIndex = 0;
      
      while ((match = TODO_REGEX.exec(text)) !== null) {
        const start = from + match.index;
        const end = start + match[0].length;
        
        // Check if we're in a comment using the syntax tree
        const tree = syntaxTree(state);
        const node = tree.resolveInner(start);
        
        if (node.type.name.includes('comment')) {
          // Add background highlight for the TODO
          builder.add(start, end, todoMark);
        }
      }
    }
  },
  {
    decorations: (v) => v.decorations,
  }
);

// CSS styles for TODOs
export const todoTheme = EditorView.baseTheme({
  '.cm-todo-mark': {
    backgroundColor: 'rgba(255, 204, 0, 0.2)',
    color: '#ff9800',
    fontWeight: 'bold',
    borderBottom: '1px dotted #ff9800',
    paddingBottom: '1px',
  }
});

// Extension combining all TODO highlighting functionality
export const todoLinter = [todoField, todoPlugin, todoTheme]; 
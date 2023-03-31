import React, { useCallback, useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import Editor, { useMonaco, loader } from '@monaco-editor/react';
import style from './style.module.scss';
import { formattedMock } from '../mock/utils';

loader.config({ monaco });
const Edit = (props) => {
  const { data } = props;

  const editorRef = useRef(null);

  const updateEditorLayout = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.layout({
      width: 'auto',
      height: 'auto',
    });
    // eslint-disable-next-line
    const editorEl = editor._domElement;
    if (!editorEl) return;
    const { width, height } = editorEl.getBoundingClientRect();
    // update responsive width and height
    editor.layout({
      width,
      height,
    });
  }, []);

  const handleEditorUpdateValue = useCallback((value) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.setValue(value || '');
    value && editor.getAction('editor.action.formatDocument').run();
  }, []);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;

    editor.getModel()?.updateOptions({ tabSize: 2, insertSpaces: false });
    updateEditorLayout();

    window.addEventListener('resize', () => {
      updateEditorLayout();
    });
    if (data.text) {
      try {
        handleEditorUpdateValue(formattedMock(JSON.stringify(JSON.parse(data.text), null, 2)));
      } catch (err) {}
    }
  };

  return (
    <div className={style.editWrapper}>
      <Editor
        language="javascript"
        options={{
          automaticLayout: true,
          autoClosingBrackets: 'always',
          autoClosingQuotes: 'always',
          formatOnPaste: true,
          formatOnType: true,
          scrollBeyondLastLine: false,
        }}
        onMount={handleEditorDidMount}
        // beforeMount={handleEditorWillMount}
      />
    </div>
  );
};

export default Edit;

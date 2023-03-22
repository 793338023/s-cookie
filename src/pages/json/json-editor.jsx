/* eslint-disable no-undef */
import React, { useCallback, useEffect, useRef } from 'react';
import { Stack } from '@fluentui/react';
import { message } from 'antd';
import * as monaco from "monaco-editor";
import Editor, { useMonaco,loader } from '@monaco-editor/react';
import { ToolBar } from './components/tool-bar';
import { BorderLine } from './styles';
import { setValueSchema, getSyncValue } from './utils';
loader.config({ monaco });

const JSONEditor = ({ defaultValue, schemaValue, id = '' }) => {
  const monaco = useMonaco();
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

  const handleJsonSchemasUpdate = useCallback(() => {
    monaco?.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      validate: true,
      schemas: schemaValue
        ? [
          {
            uri: window.location.href, // id of the first schema
            fileMatch: ['*'], // associate with our model
          },
        ]
        : undefined,
    });
  }, [schemaValue, monaco]);

  const handleEditorPrettify = useCallback(() => {
    editorRef.current?.getAction('editor.action.formatDocument').run();
  }, []);

  const handleEditorUpdateValue = useCallback((value) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.setValue(value || '');
    value && editor.getAction('editor.action.formatDocument').run();
  }, []);

  const handleEditorWillMount = () => handleJsonSchemasUpdate();

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;

    editor.getModel()?.updateOptions({ tabSize: 2, insertSpaces: false });
    updateEditorLayout();

    window.addEventListener('resize', () => {
      updateEditorLayout();
    });

    // need to use formatted prettify json string
    defaultValue && handleEditorUpdateValue(defaultValue);
  };

  useEffect(() => {
    handleEditorUpdateValue(defaultValue);
  }, [defaultValue, handleEditorUpdateValue]);

  useEffect(() => {
    handleJsonSchemasUpdate();
  }, [schemaValue, handleJsonSchemasUpdate]);

  useEffect(() => {
    updateEditorLayout();
  }, [updateEditorLayout]);

  useEffect(() => {
    handleEditorPrettify();
  }, [handleEditorPrettify]);


  const handleSyncClick = async () => {
    const data = await getSyncValue(id);
    if (data) {
      handleEditorUpdateValue(data);
    }
  }

  const handleSaveClick = async () => {
    const editor = editorRef.current;
    const value = editor && editor.getValue();
    const ret = await setValueSchema(id, value);
    if (ret) {
      message.success('保存成功');
    }
  };

  useEffect(() => {
    function handleSave(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveClick();
      }
    }
    document.addEventListener('keydown', handleSave);
    return () => {
      document.removeEventListener('keydown', handleSave);
    };
  }, []);

  return (
    <Stack styles={{
      root: {
        height: 'calc(100vh - 57px)',
        borderTop: BorderLine,
        borderRight: BorderLine,
        borderBottom: BorderLine,
      },
    }}>
      <Stack.Item>
        <ToolBar
          onSyncClick={handleSyncClick}
          onPrettifyClick={handleEditorPrettify}
          onSaveClick={handleSaveClick}
        />
      </Stack.Item>
      <Stack styles={{
        root: {
          height: 'calc(100vh - 101px)',
          borderTop: BorderLine,
          borderRight: BorderLine,
          borderBottom: BorderLine,
        },
      }}>
        <Stack.Item
          grow
          align="stretch"
          style={{
            height: `100%`,
          }}
        >
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
            beforeMount={handleEditorWillMount}
          />
        </Stack.Item>
      </Stack>
    </Stack>
  );
};

export default JSONEditor;
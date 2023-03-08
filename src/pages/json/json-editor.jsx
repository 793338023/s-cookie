/* eslint-disable no-undef */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Stack } from '@fluentui/react';
import { message } from 'antd';
import Editor, { useMonaco } from '@monaco-editor/react';
import dirtyJson from 'dirty-json';

import { ErrorMessageBar } from './components/error-message-bar';
import { TitleBar } from './components/title-bar';
import { ToolBar } from './components/tool-bar';
import { BorderLine } from './styles';
import { downloadJsonFile, minifyJsonString, prettifyJsonString, parseJsonSchemaString, setValueSchema } from './utils';

const stackStyles = {
  root: {
    height: '100vh',
    borderTop: BorderLine,
    borderRight: BorderLine,
    borderBottom: BorderLine,
  },
};

export const JSONEditor = ({ defaultValue, schemaValue, title, id = '', onChange }) => {
  const monaco = useMonaco();
  const [errors, setErrors] = useState([]);

  const editorRef = useRef(null);

  const updateEditorLayout = useCallback(() => {
    // Type BUG: editor.IDimension.width & editor.IDimension.height should be "number"
    // but it needs to have "auto" otherwise layout can't be updated;
    // eslint-disable-next-line
    const editor = editorRef.current;
    if (!editor) return;
    // Initialize layout's width and height
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
              schema: {
                ...parseJsonSchemaString(schemaValue),
              },
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

  const handleClearClick = () => editorRef.current?.setValue('');

  const handleEditorWillMount = () => handleJsonSchemasUpdate();

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;

    editor.getModel()?.updateOptions({ tabSize: 2, insertSpaces: false });
    updateEditorLayout();

    window.addEventListener('resize', () => {
      // automaticLayout isn't working
      // https://github.com/suren-atoyan/monaco-react/issues/89#issuecomment-666581193
      // clear current layout
      updateEditorLayout();
    });

    // need to use formatted prettify json string
    defaultValue && handleEditorUpdateValue(prettifyJsonString(defaultValue));
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

  const handleEditorValidation = useCallback((markers) => {
    const errorMessage = markers.map(({ startLineNumber, message }) => `line ${startLineNumber}: ${message}`);
    setErrors(errorMessage);
  }, []);

  const handleMinifyClick = () => {
    const editor = editorRef.current;
    if (!editor) return;
    const value = editor.getValue();
    const minifiedValue = minifyJsonString(value);
    editor.setValue(minifiedValue);
  };

  const handleUploadClick = (file) => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      const { result } = fileReader;
      handleEditorUpdateValue(result);
    };
    fileReader.readAsText(file);
  };

  const handleDownloadClick = () => {
    const value = editorRef.current?.getValue();
    value && downloadJsonFile(value);
  };

  const handleEditorChange = useCallback(
    (value) => {
      onChange && onChange(value);
    },
    [handleEditorPrettify, onChange],
  );


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
    <Stack styles={stackStyles}>
      {title && (
        <Stack.Item>
          <TitleBar title={title} />
        </Stack.Item>
      )}
      <Stack.Item>
        <ToolBar
          onClearClick={handleClearClick}
          onDownloadClick={handleDownloadClick}
          onMinifyClick={handleMinifyClick}
          onPrettifyClick={handleEditorPrettify}
          onUploadClick={handleUploadClick}
          onSaveClick={handleSaveClick}
        />
      </Stack.Item>
      <Stack styles={stackStyles}>
        <Stack.Item
          grow
          align="stretch"
          style={{
            height: `calc(100% - 20vh)`,
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
            onChange={handleEditorChange}
            beforeMount={handleEditorWillMount}
            onValidate={handleEditorValidation}
          />
        </Stack.Item>
        <Stack.Item
          style={{
            height: `20vh`,
          }}
        >
          <ErrorMessageBar errors={errors} />
        </Stack.Item>
      </Stack>
    </Stack>
  );
};

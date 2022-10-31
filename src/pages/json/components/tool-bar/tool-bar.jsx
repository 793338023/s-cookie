import React, { useRef } from 'react';

import { CommandBar, CommandButton } from '@fluentui/react';

// Need to fix: hover is not working
export const FileUploader = ({ onFileHandle }) => {
  const inputFileRef = useRef(null);

  const handleUploadClick = () => {
    if (inputFileRef.current) {
      // upload the same file
      inputFileRef.current.value = '';
      inputFileRef.current.click();
    }
  };

  const handleChange = (e) => {
    if (!e.target.files) return;
    const fileUploaded = e.target.files[0];
    onFileHandle(fileUploaded);
  };

  const uploadIcon = {
    iconName: 'Upload',
  };

  return (
    <>
      <CommandButton iconProps={uploadIcon} text="Upload" onClick={handleUploadClick} />
      <input
        ref={inputFileRef}
        style={{ display: 'none' }}
        onChange={handleChange}
        type="file"
        accept="application/json"
      />
    </>
  );
};

export const ToolBar = ({
  onMinifyClick,
  onPrettifyClick,
  onClearClick,
  onDownloadClick,
  onUploadClick,
  onFixClick,
  onSaveClick,
}) => {
  const leftItems = [
    {
      key: 'upload',
      key: '上传',
      onRender: () => <FileUploader onFileHandle={onUploadClick} />,
    },
    {
      key: 'download',
      text: '下载',
      ariaLabel: 'Grid view',
      iconProps: { iconName: 'Download' },
      onClick: onDownloadClick,
    },
    // {
    //   key: 'clear',
    //   text: 'Clear',
    //   iconProps: { iconName: 'Delete' },
    //   onClick: onClearClick,
    // },
    {
      key: 'fix',
      text: ' 修复',
      iconProps: { iconName: 'DeveloperTools' },
      onClick: onFixClick,
    },
    {
      key: 'minify',
      text: '压缩',
      iconProps: { iconName: 'MinimumValue' },
      onClick: onMinifyClick,
    },
    {
      key: 'prettify',
      text: '美化',
      iconProps: { iconName: 'Code' },
      onClick: onPrettifyClick,
    },
    {
      key: 'save',
      text: '保存',
      iconProps: { iconName: 'Code' },
      onClick: onSaveClick,
    },
  ];

  return (
    <CommandBar
      styles={{
        root: {
          alignItems: 'center',
          // borderTop: "1px solid rgb(237, 235, 233)",
        },
      }}
      items={leftItems}
      ariaLabel="json content commands"
    />
  );
};

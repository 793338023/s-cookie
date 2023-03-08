/* eslint-disable no-undef */
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { JSONEditor } from './json-editor';
import { getValueSchema } from './utils';

const bg = chrome?.extension?.getBackgroundPage();

const Index = () => {
  const { '*': id } = useParams();
  const [schema, setSchema] = useState();

  async function getSchema() {
    const val = await getValueSchema(id);
    setSchema(val);
  }

  useEffect(() => {
    getSchema();
  }, [id]);

  return schema ? (
    <JSONEditor id={id} title="数据" schemaValue={schema} defaultValue={schema} />
  ) : null;
};

export default Index;

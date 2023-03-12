/* eslint-disable no-undef */
import React, { useEffect, useState } from 'react';
import { JSONEditor } from './json-editor';
import { getValueSchema } from './utils';

const Index = (props) => {
  let { id } = props;
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

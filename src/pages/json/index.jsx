/* eslint-disable no-undef */
import React, { useEffect, useState, lazy, Suspense } from 'react';
import { getValueSchema } from './utils';
const JSONEditor = lazy(() => import('./json-editor'));

const Index = (props) => {
  let { id } = props;
  const [schema, setSchema] = useState();
  const [desc, setDesc] = useState();

  async function getSchema() {
    const val = await getValueSchema(id);
    setSchema(val?.text);
    setDesc(val?.desc);
  }

  useEffect(() => {
    getSchema();
  }, [id]);
  return schema ? (
    <Suspense fallback={<div>Loading...</div>}>
      <JSONEditor id={id} title="数据" schemaValue={schema} desc={desc} defaultValue={schema} />
    </Suspense>
  ) : null;
};

export default Index;

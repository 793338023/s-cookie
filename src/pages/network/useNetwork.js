import { useState, useEffect, useRef } from 'react';
import * as bg from "@/tools";

export default () => {
  const list = useRef([]);
  const hostRef = useRef();
  const [, update] = useState({});

  useEffect(() => {
    bg.event.trigger(bg.SNETWORKSTART, true);
    bg.event.addListener(bg.SNETWORK, data => {
      const newData = data.reduce((pre, curr) => {
        const url = curr.url.split("?")[0];

        if (hostRef.current && url.indexOf(hostRef.current) === -1) {
          return pre;
        }

        const item = list.current.find(d => d.url === url);
        if (item) {
          if (!item.checked) {
            item.text = curr.text;
          }
          return pre;
        }
        pre.push({ ...curr, url });
        return pre;
      }, []);
      list.current = [...list.current, ...newData];
      update({});
    });

    bg.event.addListener(bg.SNETWORKHOST, host => {
      if (host !== hostRef.current) {
        hostRef.current = host;
        if (hostRef.current) {
          list.current = [];
          update({});
        }
      }
    });
    return () => {
      bg.event.trigger(bg.SNETWORKSTART, false);
      bg.event.removeListener(bg.SNETWORK);
    }
  }, []);

  function handleList(item, data = {}) {
    const curr = list.current.find(d => d.url === item.url);
    if (curr) {
      Object.assign(curr, data);
      update({});
    }
  }

  return { list: list.current, handleList };
}
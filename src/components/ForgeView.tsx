import React from 'react';
import AppBuilderWorkspace from './AppBuilderWorkspace';

export default function ForgeView({ state, updateState, notify, setActiveTab }: any) {
  return (
    <AppBuilderWorkspace 
      state={state} 
      updateState={updateState} 
      notify={notify} 
      setActiveTab={setActiveTab}
    />
  );
}

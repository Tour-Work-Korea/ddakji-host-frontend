import React, {createContext, forwardRef, useContext} from 'react';
import {Text, StyleSheet} from 'react-native';
import useDisplaySettingsStore from '@stores/displaySettingsStore';

const NestedTextContext = createContext(false);

// System accessibility scaling remains enabled independently of the app setting.
const ScalableText = forwardRef(({style, children, ...props}, ref) => {
  const largeText = useDisplaySettingsStore(state => state.largeText);
  const nested = useContext(NestedTextContext);
  const flattened = StyleSheet.flatten(style) || {};
  const fontSize = flattened.fontSize ?? (nested ? undefined : 14);
  const scaled = largeText ? {
    ...(fontSize != null ? {fontSize: fontSize * 1.15} : {}),
    ...(flattened.lineHeight != null ? {lineHeight: flattened.lineHeight * 1.15} : {}),
  } : null;
  return (
    <Text ref={ref} {...props} style={[style, scaled]}>
      <NestedTextContext.Provider value={true}>{children}</NestedTextContext.Provider>
    </Text>
  );
});
ScalableText.displayName = 'ScalableText';
export default ScalableText;

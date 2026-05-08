import { TextInput, View, Text, TextInputProps } from "react-native";

export const Input = ({
  label, error, ...props
}: TextInputProps & { label?: string; error?: string }) => (
  <View className="gap-1">
    {label && <Text className="text-muted text-xs uppercase tracking-wider">{label}</Text>}
    <TextInput
      placeholderTextColor="#64748B"
      className="bg-surface text-white rounded-2xl px-4 py-4 border border-border"
      {...props}
    />
    {error && <Text className="text-danger text-xs">{error}</Text>}
  </View>
);
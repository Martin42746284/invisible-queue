import { Text, View } from "react-native";
import { Button } from "./Button";
export const ErrorState = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
  <View className="items-center gap-3 py-8">
    <Text className="text-danger text-center">{message}</Text>
    {onRetry && <Button variant="secondary" onPress={onRetry}>Réessayer</Button>}
  </View>
);
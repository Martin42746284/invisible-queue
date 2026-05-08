import { useMutation } from "@tanstack/react-query";
import { entriesService } from "@/services/entries.service";

export const useJoinQueue = () =>
  useMutation({
    mutationFn: entriesService.join,
  });

export const useLeaveQueue = () =>
  useMutation({
    mutationFn: (entryId: string) => entriesService.leave(entryId),
  });
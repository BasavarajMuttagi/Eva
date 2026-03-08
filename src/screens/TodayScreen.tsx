import { LogList } from "@/src/components/LogList";
import { useLogStore } from "@/src/store/LogStore";
import { useEffect } from "react";

export default function TodayScreen() {
  const { sync } = useLogStore();

  useEffect(() => {
    sync();
  }, []);

  return (
    <LogList
      date={new Date()}
      showRefresh
      emptyTitle="Nothing logged yet"
      emptySubtitle="Type what you ate above and tap Add"
    />
  );
}

import { Component, For, createSignal } from "solid-js";
import { createStore, produce, reconcile } from "solid-js/store";
import { TransitionGroup } from "solid-transition-group";
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
  createQuery,
} from "@tanstack/solid-query";
import { Toaster, toast } from "solid-toast";
import "./styles.css";

const client = new QueryClient({
  defaultOptions: {
    queries: {
      // reconcile: "fruit",
    },
  },
});

const createRandomArray = () => {
  const array = Array.from({ length: 11 }, (_, i) => i);
  return array.sort(() => Math.random() - 0.5);
};

const fruits = [
  "Strawberry",
  "Coconut",
  "Kiwi",
  "Grape",
  "Watermelon",
  "Pineapple",
  "Pear",
  "Peach",
  "Blueberry",
  "Orange",
  "Mango",
] as const;

const emojis: Record<Fruit, string> = {
  Strawberry: "🍓",
  Coconut: "🥥",
  Kiwi: "🥝",
  Grape: "🍇",
  Watermelon: "🍉",
  Pineapple: "🍍",
  Pear: "🍐",
  Peach: "🍑",
  Blueberry: "🫐",
  Orange: "🍊",
  Mango: "🥭",
};

type Fruit = typeof fruits[number];
type FruitPayload = {
  fruit: Fruit;
  emoji: string;
};

const Group: Component = () => {
  let indexCount = 5;

  const queryClient = useQueryClient();

  const createNewData = (count: number) => {
    const indexes = Array.from({ length: count }, (_, i) => i);
    const fruitsResponse: FruitPayload[] = [];

    indexes.forEach((val, idx) => {
      fruitsResponse.push({
        fruit: fruits[indexCount - val],
        emoji: emojis[fruits[indexCount - val]],
      });
    });
    return fruitsResponse;
  };

  const mutate = () => {
    indexCount++;
    if (indexCount > 10) {
      toast.error("No more fruits to add");
      return;
    }
    queryClient.setQueryData(["fruits"], (prev: FruitPayload[] | undefined) => {
      const newFruit = {
        fruit: fruits[indexCount],
        emoji: emojis[fruits[indexCount]],
      };
      if (!prev) return [newFruit];
      return [newFruit, ...prev];
    });
  };

  const query = createQuery(() => ({
    queryKey: ["fruits"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      return createNewData(indexCount);
    },
    placeholderData: (prev) => prev,
    reconcile: "fruit",
  }));

  return (
    <div class="flex flex-col items-center p-16">
      <div class="flex gap-1">
        <button
          class="text-sm bg-purple-600 rounded text-purple-50 px-4 py-2"
          onClick={mutate}
        >
          Add Fruit
        </button>
      </div>
      <div class="mt-8 flex gap-2 flex-col w-80">
        <TransitionGroup name="group-item">
          <For each={query.data}>
            {(val) => (
              <div class="group-item bg-white flex gap-4 text-sm px-5 items-center text-gray-600 font-medium border shadow py-3 rounded-md">
                <span>{val.emoji}</span>
                <span>{val.fruit}</span>
              </div>
            )}
          </For>
        </TransitionGroup>
      </div>
    </div>
  );
};

const App: Component = () => {
  return (
    <QueryClientProvider client={client}>
      <Toaster />
      {/* <Query /> */}
      <Group />
    </QueryClientProvider>
  );
};

export default App;

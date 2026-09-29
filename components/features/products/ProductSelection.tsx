"use client";
import {createContext, useContext, useState, type ReactNode} from "react";

const Selection = createContext<{image: string | null; selectImage: (image: string) => void} | null>(null);

export default function ProductSelection({children}: {children: ReactNode}) {
  const [image, selectImage] = useState<string | null>(null);
  return <Selection.Provider value={{image, selectImage}}>{children}</Selection.Provider>;
}

export const useProductSelection = () => useContext(Selection);

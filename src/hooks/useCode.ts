import { useEffect, useState } from 'react';

interface UseCodeReturn {
  discountMultiple: number;
  code: string;
  isLoading: boolean;
  setCode: (code: string) => void;
}

const useCode = (): UseCodeReturn => {
  const [code, setCode] = useState<string>('');
  const [discountMultiple, setDiscountMultiple] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const codeFix = code.trim().toLowerCase();

    console.log('[HOOK] code', codeFix);

    if (codeFix === '') {
      setDiscountMultiple(1);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const timeoutId = setTimeout(() => {
      if (codeFix === 'rapax') {
        setDiscountMultiple(0.9);
      } else if (codeFix === 'la crypta') {
        setDiscountMultiple(0.8);
      } else {
        setDiscountMultiple(1);
      }

      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [code]);

  return {
    discountMultiple,
    code,
    isLoading,
    setCode,
  };
};

export default useCode;

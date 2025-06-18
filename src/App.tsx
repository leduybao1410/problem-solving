import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { NumericFormat } from 'react-number-format';
import { Loader2, ArrowUpDown } from 'lucide-react';
import { Button } from './components/ui/button';
import { showToast } from './lib/toast';
import { MyToaster } from './components/ui/toaster';

interface PriceData {
  currency: string;
  date: number;
  price: number;
}

interface FormData {
  fromCurrency: string;
  fromAmount: number;
  toCurrency: string;
  toAmount: number;
}

export default function App() {
  const { register, handleSubmit, watch, formState: { errors }, setValue, trigger } = useForm<FormData>({
    defaultValues: {
      fromCurrency: '',
      toCurrency: '',
      fromAmount: 0,
      toAmount: 0,
    },
  });

  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [isLoadingRates, setIsLoadingRates] = useState<boolean>(true);

  // Watch form fields for real-time calculation
  const fromAmount = watch('fromAmount');
  const fromCurrency = watch('fromCurrency');
  const toAmount = watch('toAmount');
  const toCurrency = watch('toCurrency');

  // Fetch and process exchange rates
  useEffect(() => {
    const fetchExchangeRates = async () => {
      setIsLoadingRates(true);
      try {
        const response = await fetch('https://interview.switcheo.com/prices.json');
        const data: PriceData[] = await response.json();

        // Create a map of latest prices per currency
        const latestPrices: Record<string, number> = {};
        const currencyDates: Record<string, number> = {};

        // First pass: find latest date for each currency
        data.forEach(item => {
          if (!currencyDates[item.currency] || item.date > currencyDates[item.currency]) {
            currencyDates[item.currency] = item.date;
          }
        });

        // Second pass: only keep prices from latest dates
        data.forEach(item => {
          if (item.date === currencyDates[item.currency]) {
            latestPrices[item.currency] = item.price;
          }
        });

        setExchangeRates(latestPrices);
      } catch (error) {
        console.error('Error fetching exchange rates:', error);
        showToast('error', 'Error', 'Failed to fetch exchange rates');
      } finally {
        setIsLoadingRates(false);
      }
    };

    fetchExchangeRates();
  }, []);

  // Filter available currencies from exchangeRates
  const availableCurrencies = Object.keys(exchangeRates).length > 0
    ? Object.keys(exchangeRates).sort()
    : ['BTC', 'ETH', 'USDT'];

  // Calculate conversion when inputs change
  useEffect(() => {
    if (fromAmount > 0 && fromCurrency && toCurrency) {
      const fromPrice = exchangeRates[fromCurrency];
      const toPrice = exchangeRates[toCurrency];
      if (toPrice && fromPrice) {
        const rate = fromPrice / toPrice;
        const calculatedAmount = fromAmount * rate; // Changed from toAmount to fromAmount
        setValue('toAmount', Number(calculatedAmount.toFixed(6)));
      } else {
        setValue('toAmount', 0);
      }
    } else {
      setValue('toAmount', 0);
    }
  }, [fromAmount, fromCurrency, toCurrency, setValue, exchangeRates]);

  const handleSwapCurrencies = () => {
    const tempCurrency = fromCurrency;
    const tempAmount = fromAmount;
    setValue('fromCurrency', toCurrency);
    setValue('toCurrency', tempCurrency);
    setValue('fromAmount', toAmount);
    setValue('toAmount', tempAmount);
    trigger();
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      showToast(
        'success',
        'Swap completed',
        `Successfully swapped ${data.fromAmount.toLocaleString()} ${data.fromCurrency} to ${data.toAmount.toLocaleString()} ${data.toCurrency}`
      );
    } catch (error) {
      console.error('Error during swap:', error);
      showToast(
        'error',
        'Swap failed',
        'An error occurred during the swap process'
      );
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return !loading &&
      fromAmount > 0 &&
      toAmount > 0 &&
      fromCurrency &&
      toCurrency &&
      fromCurrency !== toCurrency;
  };

  function MySeparator() {
    return (<div className='h-0.5 w-full rounded-full bg-gradient-to-r from-blue-400 to-purple-400 my-4' />)
  }

  return (
    <div className="w-screen h-screen bg-gray-900 overflow-hidden flex items-center justify-center md:p-0 p-4">
      <img src={'/images/bgImg.webp'} width={2000} height={2000} className='object-cover w-screen h-screen absolute z-0 top-0 left-0 flex' />
      <div className='z-10 size-full grid md:grid-cols-2 grid-cols-1'>
        <div className='col-span-1'></div>
        <div className="col-span-1 w-full bg-gradient-to-br from-gray-800/90 via-gray-700/90 to-gray-900/90 flex flex-col items-stretch justify-center p-6 md:rounded-tl-3xl md:rounded-bl-3xl rounded-3xl shadow-lg text-white">
          <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Currency Swap</h2>
          <MySeparator />
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
            <MyToaster duration={5000} />

            {/* From Currency */}
            <div>
              <label className="block mb-1 text-sm font-medium">From:</label>
              <Select
                onValueChange={(value) => setValue('fromCurrency', value)}
                value={fromCurrency}
                disabled={isLoadingRates}
              >
                <SelectTrigger className="w-full bg-gradient-to-r from-gray-700 to-gray-600 border-gray-500">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {availableCurrencies.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      <div className="flex items-center">
                        <img
                          src={`/tokens/${currency}.svg`}
                          alt={currency}
                          className="w-4 h-4 mr-2"
                        />
                        {currency}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.fromCurrency && <span className="text-red-500 text-sm">{errors.fromCurrency.message}</span>}
            </div>

            {/* From Amount */}
            <div>
              <label className="block mb-1 text-sm font-medium">Amount:</label>
              <NumericFormat
                value={`${fromAmount}`}
                prefix={`${fromCurrency}  | `}
                onValueChange={(values) => {
                  setValue('fromAmount', Number(values.value));
                }}
                allowLeadingZeros={false}
                allowNegative={false}
                decimalScale={6}
                thousandsGroupStyle='thousand'
                thousandSeparator
                className="w-full p-2 bg-gradient-to-r from-gray-700 to-gray-600 border border-gray-500 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                {...register('fromAmount', {
                  required: 'Amount is required',
                  min: { value: 0.000001, message: 'Minimum amount is 0.000001' }
                })}
              />
              {errors.fromAmount && <span className="text-red-500 text-sm">{errors.fromAmount.message}</span>}
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleSwapCurrencies}
                disabled={!fromCurrency || !toCurrency}
                className="hover:bg-gradient-to-r hover:from-gray-600 hover:to-gray-500 w-12 h-12"
                title="Swap currencies"
              >
                <ArrowUpDown className='!w-10 !h-10  text-purple-400' />
              </Button>
            </div>

            {/* To Currency */}
            <div>
              <label className="block mb-1 text-sm font-medium">To:</label>
              <Select
                onValueChange={(value) => setValue('toCurrency', value)}
                value={toCurrency}
                disabled={isLoadingRates}
              >
                <SelectTrigger className="w-full bg-gradient-to-r from-gray-700 to-gray-600 border-gray-500">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {availableCurrencies.map((currency) => (
                    <SelectItem
                      disabled={fromCurrency === currency}
                      key={currency}
                      value={currency}
                    >
                      <div className="flex items-center">
                        <img
                          src={`/tokens/${currency}.svg`}
                          alt={currency}
                          className="w-4 h-4 mr-2"
                        />
                        {currency}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.toCurrency && <span className="text-red-500 text-sm">{errors.toCurrency.message}</span>}
            </div>

            {/* To Amount */}
            <div>
              <label className="block mb-1 text-sm font-medium">Amount:</label>
              <NumericFormat
                disabled={true}
                value={`${toAmount}`}
                prefix={`${toCurrency}  | `}
                allowLeadingZeros={false}
                allowNegative={false}
                decimalScale={6}
                thousandsGroupStyle='thousand'
                thousandSeparator
                className="w-full p-2 bg-gradient-to-r from-gray-700 to-gray-600 border border-gray-500 rounded-sm opacity-75"
                {...register('toAmount')}
              />
            </div>
            <MySeparator />
            {/* Submit Button */}
            <Button
              type="submit"
              className={`w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 ${isFormValid() && 'cursor-pointer'}`}
              disabled={!isFormValid()}
              title="Swap"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Swap'
              )}
            </Button>
          </form>
        </div>
      </div>

    </div>
  );
}

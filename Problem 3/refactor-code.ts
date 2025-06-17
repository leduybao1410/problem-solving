interface WalletBalance {
    currency: string;
    amount: number;
    blockchain: string; // Added blockchain field
}

// Redundant declaration
// interface FormattedWalletBalance {
//     currency: string;
//     amount: number;
//     formatted: string;
//   }

type BLOCKCHAIN_PRIORITY = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo' | undefined;

interface Props extends BoxProps { }

// short version for declare variables
const WalletPage: React.FC<Props> = ({ children, ...rest }: Props) => {
    const balances = useWalletBalances();
    const prices = usePrices();

    // declare type of input to by string
    const getPriority = (blockchain: string): number => {
        switch (blockchain) {
            case 'Osmosis':
                return 100;
            case 'Ethereum':
                return 50;
            case 'Arbitrum':
                return 30;
            case 'Zilliqa':
                return 20;
            case 'Neo':
                return 20;
            default:
                return -99;
        }
    }

    const sortedBalances = useMemo(() => {
        return balances
            .filter((balance: WalletBalance) => {
                const balancePriority = getPriority(balance.blockchain);// added blockchain field on the top

                // lhsPriority undefined
                //   if (lhsPriority > -99) {
                //     if (balance.amount <= 0) {
                //         return true;
                //     }
                // }
                // return false

                // *** Replace with shortter version - improve readability
                return balancePriority > -99 && balance.amount <= 0;
            })
            .sort((lhs: WalletBalance, rhs: WalletBalance) => {
                const leftPriority = getPriority(lhs.blockchain);
                const rightPriority = getPriority(rhs.blockchain);

                // Redundant Logic
                //   if (leftPriority > rightPriority) {
                //     return -1;
                // } else if (rightPriority > leftPriority) {
                //     return 1;
                // }

                // *** Replace with shortter version - improve readability
                return rightPriority - leftPriority;
            });
    }, [balances, getPriority]);//Eliminate listining to prices


    // MORE MEMORY USED, NOT OPTIMIZED
    // const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
    //     return {
    //         ...balance,
    //         formatted: balance.amount.toFixed()
    //     }
    // })


    const rows = sortedBalances.map((balance: WalletBalance, index) => {
        // handle undefined variables
        if (!prices || prices[balance.currency] || balance.amount) {
            return;
        }
        const usdValue = (prices[balance.currency] ?? 0) * balance.amount;
        // *** Eliminates unnecessary computation and memory usage.
        const formattedAmount = balance.amount.toFixed(2);
        return (
            <WalletRow
            className= { classes.row }
        key = { index } // Assuming currency is unique
        amount = { balance.amount }
        usdValue = { usdValue }
        formattedAmount = { formattedAmount } // Format with 2 decimals
            />
      );
});

return (<div { ...rest } >
    { rows }
    </div>);
  };
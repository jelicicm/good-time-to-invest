import unittest

from good_time_to_invest.etf_math import Statistics, InvestorActor, BankActor, PortfolioActor, n_month_calculation, top_level_calculation

class TestWork(unittest.TestCase):
    def __init__(self, methodName: str = "runTest") -> None:
        super().__init__(methodName)

        self.expected_yearly_growth_pct = 7
        self.provisional_transfer_loss_pct = 0.3
        self.fixed_rate_transfer_loss = 1100/117.5
        self.planned_monthly_deposit = 500

    def testBankActorOnlyFixed(self):
        fixed_fee = 10
        bank = BankActor(fixed_fee, 0)

        for _ in range(6):
            self.assertTrue(bank.expenses_for_deposit(123), fixed_fee)

        self.assertTrue(bank.total_earned() == 6*fixed_fee)

    def testBankActorOnlyVar(self):
        var_fee_pct = 10
        bank = BankActor(0, var_fee_pct)

        for _ in range(6):
            self.assertTrue(bank.expenses_for_deposit(200), 20)
        
        self.assertTrue(bank.total_earned(), 6*20)

    def testBankActorFixedAndVar(self):
        fixed_fee = 9
        var_fee_pct = 7

        bank = BankActor(fixed_fee, var_fee_pct)

        for _ in range(6):
            self.assertTrue(bank.expenses_for_deposit(1000), 79)
        
        self.assertTrue(bank.total_earned(), 6*79)

    def testSingleMonth(self):
        investor = InvestorActor(self.planned_monthly_deposit)
        bank = BankActor(10, 1)
        portfolio = PortfolioActor(self.expected_yearly_growth_pct)
        stats = n_month_calculation(
            investor,
            bank,
            portfolio,
            1, # deposit on x-th month
            1  # months to sim
        )

        self.assertTrue(stats.total_money_in == investor.spent())
        self.assertTrue(stats.total_transfer_losses == bank.total_earned())

        expected_money_out = (investor.spent()-bank.total_earned())
        self.assertTrue(stats.total_money_out == expected_money_out, f'Expected: {expected_money_out}; got: {stats.total_money_out}')


    def testTwoMonthsOneDeposit(self):
        investor = InvestorActor(self.planned_monthly_deposit)
        bank = BankActor(10, 1)
        portfolio = PortfolioActor(self.expected_yearly_growth_pct, 0)
        stats = n_month_calculation(
            investor,
            bank,
            portfolio,
            2, # deposit on x-th month
            2  # months to sim
        )

        self.assertTrue(stats.total_money_in == investor.spent())
        self.assertTrue(stats.total_transfer_losses == bank.total_earned())
        
        planned_monthly_deposit = self.planned_monthly_deposit*2
        second_month = (planned_monthly_deposit-bank.expenses_for_deposit(planned_monthly_deposit))
        self.assertTrue(stats.total_money_out == second_month, f'Expected: {second_month}; got: {stats.total_money_out}')


    def testTwoMonthsTwoDeposits(self):
        investor = InvestorActor(self.planned_monthly_deposit)
        bank = BankActor(10, 1)
        portfolio = PortfolioActor(self.expected_yearly_growth_pct, 0)
        stats = n_month_calculation(
            investor,
            bank,
            portfolio,
            1, # deposit on x-th month
            2  # months to sim
        )

        self.assertTrue(stats.total_money_in == investor.spent(), f'Expected: {investor.spent()}, got {stats.total_money_in}')
        self.assertTrue(stats.total_transfer_losses == bank.total_earned())
        
        first_month = (self.planned_monthly_deposit-bank.expenses_for_deposit(self.planned_monthly_deposit))
        second_month = (self.planned_monthly_deposit-bank.expenses_for_deposit(self.planned_monthly_deposit)) + first_month*(1+self.expected_yearly_growth_pct/100./12.)
        self.assertTrue(stats.total_money_out == second_month, f'Expected: {second_month}; got: {stats.total_money_out}')

    def testStartingSaldo(self):
        investor = InvestorActor(self.planned_monthly_deposit)
        bank = BankActor(10, 1)
        portfolio = PortfolioActor(self.expected_yearly_growth_pct, 2000)
        stats = n_month_calculation(
            investor,
            bank,
            portfolio,
            1, # deposit on x-th month
            2  # months to sim
        )

        self.assertTrue(stats.total_money_in == investor.spent()+2000, f'Expected: {investor.spent()}, got {stats.total_money_in}')
        self.assertTrue(stats.total_transfer_losses == bank.total_earned())
        
        first_month = 2000*(1+self.expected_yearly_growth_pct/100./12.) + (self.planned_monthly_deposit-bank.expenses_for_deposit(self.planned_monthly_deposit))
        second_month = (self.planned_monthly_deposit-bank.expenses_for_deposit(self.planned_monthly_deposit)) + first_month*(1+self.expected_yearly_growth_pct/100./12.)
        # self.assertTrue(stats.total_money_out == second_month, f'Expected: {second_month}; got: {stats.total_money_out}')


    def testPortfolio(self):
        portfolio = PortfolioActor(self.expected_yearly_growth_pct, 2000)

        self.assertTrue(portfolio.starting_saldo() == 2000)
        
        for i in range(7):
            portfolio.calc_growth_for_period(0)

        self.assertTrue(portfolio.total() == portfolio.starting_saldo()*(1+self.expected_yearly_growth_pct/100./12.)**7)
    

    def testSameAmountDeposited(self):
        # investor = InvestorActor(1000)
        # bank = BankActor(self.fixed_rate_transfer_loss, self.provisional_transfer_loss_pct)
        # portfolio = PortfolioActor(7.5) #self.expected_yearly_growth_pct,
        import numpy as np
        
        monthly_deposits = [1, 2, 3, 4, 5, 6]
        months_to_sim = np.lcm.reduce(monthly_deposits)

        stats = [n_month_calculation(
            InvestorActor(750),
            BankActor(self.fixed_rate_transfer_loss, self.provisional_transfer_loss_pct),
            PortfolioActor(7.5), #self.expected_yearly_growth_pct,
            month_idx, # deposit on x-th month
            months_to_sim
        ) for month_idx in monthly_deposits]
        
        for i in range(1, len(stats)):
            self.assertTrue(stats[0].total_money_in == stats[i].total_money_in, f'error in {i}: {stats[0].total_money_in} != {stats[i].total_money_in}')

        print(f'All sims have spent in total ${stats[0].total_money_in} in {months_to_sim} months')
    
        for i, stat in enumerate(stats):
            print(f'Deposit on every {i+1} months: Total banking expenses {stat.total_transfer_losses:.2f}; Total earnings {stat.total_money_out:.2f}')

        max_earning = max([stat.total_money_out for stat in stats])
        max_earning_index = [stat.total_money_out for stat in stats].index(max_earning)
        print(max_earning_index+1)

    def testTopLevelSameAmountDeposited(self):
        # investor = InvestorActor(1000)
        # bank = BankActor(self.fixed_rate_transfer_loss, self.provisional_transfer_loss_pct)
        # portfolio = PortfolioActor(7.5) #self.expected_yearly_growth_pct,
        
        months_to_sim = 60

        stats = top_level_calculation(
            fixed_rate = self.fixed_rate_transfer_loss, 
            variable_rate = self.provisional_transfer_loss_pct,
            monthly_deposit = 750,
            yearly_growth = 7.5,
            months_to_simulate = months_to_sim)
        
        for i in range(1, len(stats)):
            self.assertTrue(stats[0].total_money_in == stats[i].total_money_in, f'error in {i}: {stats[0].total_money_in} != {stats[i].total_money_in}')

        print(f'All sims have spent in total ${stats[0].total_money_in} in {months_to_sim} months')
    
        for i, stat in enumerate(stats):
            print(f'Deposit on every {i+1} months: Total banking expenses {stat.total_transfer_losses:.2f}; Total earnings {stat.total_money_out:.2f}')

        max_earning = max([stat.total_money_out for stat in stats])
        max_earning_index = [stat.total_money_out for stat in stats].index(max_earning)
        print(max_earning_index+1)


if __name__ == "__main__":
    unittest.main()
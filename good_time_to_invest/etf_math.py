from dataclasses import dataclass
import good_time_to_invest.math_utils as mutils

@dataclass
class Statistics:
    starting_saldo : float
    deposit_on_x_th_month: int
    total_money_in : float
    total_transfer_losses : float
    total_money_out : float


class BankActor:
    def __init__(self, fixed_charge_rate: float = 0, variable_charge_rate_pct: float = 0) -> None:
        self._fixed_expenses = fixed_charge_rate
        self._variable_expenses_coef = mutils.pct_to_fraction(variable_charge_rate_pct)
        self._sim_total_earned = 0

    def expenses_for_deposit(self, deposit_amount: float):
        provisional_expenses = self._variable_expenses_coef*deposit_amount
        transaction_fee = self._fixed_expenses+provisional_expenses
        self._sim_total_earned += transaction_fee
        return transaction_fee

    def total_earned(self):
        return self._sim_total_earned
    

class InvestorActor:
    def __init__(self, monthly_deposit: float = 0) -> None:
        self.monthly_deposit = monthly_deposit
        self.total_spent = 0

    def take_amount(self, for_x_months: int) -> float:
        to_give = for_x_months * self.monthly_deposit
        self.total_spent += to_give
        return to_give

    def spent(self):
        return self.total_spent


class PortfolioActor:
    def __init__(self, expected_yearly_growth_pct: float, starting_saldo: float = 0) -> None:
        self.expected_yearly_growth_pct = expected_yearly_growth_pct
        self.expected_monthly_growth = 1+mutils.pct_to_fraction(expected_yearly_growth_pct)/12.
        self.starting_amount = starting_saldo
        self.current_amount = starting_saldo

    def starting_saldo(self):
        return self.starting_amount
    
    def total(self):
        return self.current_amount
    
    def calc_growth_for_period(self, deposit_amount):
        self.current_amount *= self.expected_monthly_growth
        self.current_amount += deposit_amount


def n_month_calculation(investor: InvestorActor,
                        bank: BankActor,
                        portfolio: PortfolioActor,
                        deposit_on_x_th_month: int,
                        months_to_sim: int = 12) -> Statistics:
    
    assert(isinstance(deposit_on_x_th_month, int))
    assert(deposit_on_x_th_month > 0)

    for m in range(months_to_sim):

        deposit_this_month = 0

        if (m+1) % deposit_on_x_th_month == 0:
            investing_amount = investor.take_amount(deposit_on_x_th_month)
            bank_fees = bank.expenses_for_deposit(investing_amount)
            deposit_this_month = investing_amount - bank_fees

        portfolio.calc_growth_for_period(deposit_this_month)
    
    return Statistics(portfolio.starting_saldo(), deposit_on_x_th_month, portfolio.starting_saldo()+investor.spent(), bank.total_earned(), portfolio.total())

def top_level_calculation(fixed_rate: float, variable_rate: float, monthly_deposit: float, yearly_growth: float, months_to_simulate: int):

    month_number_denominators = mutils.factors(months_to_simulate)

    return [n_month_calculation(InvestorActor(monthly_deposit=monthly_deposit),
                                BankActor(fixed_charge_rate=fixed_rate, variable_charge_rate_pct=variable_rate),
                                PortfolioActor(expected_yearly_growth_pct=yearly_growth, starting_saldo=0),
                                deposit_on_x_th_month=x,
                                months_to_sim=months_to_simulate) for x in month_number_denominators]
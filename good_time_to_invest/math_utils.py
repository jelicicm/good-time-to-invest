from functools import reduce

def factors(n):    
    return sorted(set(reduce(list.__add__, 
                ([i, n//i] for i in range(1, int(n**0.5) + 1) if n % i == 0))))


def pct_to_fraction(percentage: float):
    return percentage/100.

def statistics_to_json(stat_obj):
    return {
        'starting_saldo': stat_obj.starting_saldo,
        'deposit_on_x_th_month': stat_obj.deposit_on_x_th_month,
        'total_money_in': stat_obj.total_money_in,
        'total_transfer_losses': stat_obj.total_transfer_losses,
        'total_money_out': stat_obj.total_money_out,
    }

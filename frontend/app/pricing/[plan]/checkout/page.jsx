'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Info, CreditCard, ChevronDown } from 'lucide-react';
import AnimatedLogoIcon from '../../../components/AnimatedLogoIcon';

const planData = {
  'core': {
    name: 'Vibe AI Core',
    priceMonthly: 29.99,
    priceYearly: 287.88, // 23.99 * 12
    priceYearlyMonthly: 23.99,
    currency: '€',
    credits: 30
  },
  'pro-plus': {
    name: 'Vibe AI Pro+',
    priceMonthly: 39.99,
    priceYearly: 383.90, // 31.99 * 12
    priceYearlyMonthly: 31.99,
    currency: '€',
    credits: 40
  },
  'ultra': {
    name: 'Vibe AI Ultra',
    priceMonthly: 54.99,
    priceYearly: 527.90, // 43.99 * 12
    priceYearlyMonthly: 43.99,
    currency: '€',
    credits: 50
  },
  'ultra-plus': {
    name: 'Vibe AI Ultra+',
    priceMonthly: 79.99,
    priceYearly: 767.90, // 63.99 * 12
    priceYearlyMonthly: 63.99,
    currency: '€',
    credits: 75
  },
  'teams': {
    name: 'Vibe AI Teams',
    priceMonthly: 99.99,
    priceYearly: 959.88, // 79.99 * 12
    priceYearlyMonthly: 79.99,
    currency: '€',
    credits: 100
  },
  'starter': {
    name: 'Starter',
    priceMonthly: 0,
    priceYearly: 0,
    priceYearlyMonthly: 0,
    currency: '€',
    credits: 0
  },
  'on-demand': {
    name: 'On Demand',
    priceMonthly: 0, // Will be set from URL parameter
    priceYearly: 0,
    priceYearlyMonthly: 0,
    currency: '€',
    credits: 0
  }
};

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const planKey = params?.plan || 'core';
  const isYearly = searchParams?.get('yearly') === 'true';
  const amountParam = searchParams?.get('amount');
  
  // For on-demand, use amount from URL parameter
  const plan = planData[planKey] || planData['core'];
  if (planKey === 'on-demand' && amountParam) {
    const amount = parseFloat(amountParam) || 10;
    plan.priceMonthly = amount;
    plan.priceYearly = amount;
    plan.priceYearlyMonthly = amount;
  }
  
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [email, setEmail] = useState('');
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);
  const [vat, setVat] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch calculation from backend
  useEffect(() => {
    const fetchCalculation = async () => {
      try {
        setLoading(true);
        const requestBody = {
          plan: planKey,
          is_yearly: isYearly,
          email: email || 'placeholder@example.com',
          promo_code: promoCode || null
        };
        
        // For on-demand, include amount
        if (planKey === 'on-demand' && amountParam) {
          requestBody.amount = parseFloat(amountParam);
        }
        
        const response = await fetch('/api/checkout/calculate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        });
        
        if (response.ok) {
          const data = await response.json();
          setSubtotal(data.subtotal);
          setVat(data.vat_amount);
          setTotal(data.total);
          setDiscount(data.discount || 0);
        } else {
          // Fallback to client-side calculation
          const basePrice = isYearly ? plan.priceYearly : plan.priceMonthly;
          const calculatedSubtotal = basePrice;
          const calculatedVat = calculatedSubtotal * 0.19;
          const calculatedTotal = calculatedSubtotal + calculatedVat;
          setSubtotal(calculatedSubtotal);
          setVat(calculatedVat);
          setTotal(calculatedTotal);
        }
      } catch (error) {
        console.error('Error fetching calculation:', error);
        // Fallback to client-side calculation
        const basePrice = isYearly ? plan.priceYearly : plan.priceMonthly;
        const calculatedSubtotal = basePrice;
        const calculatedVat = calculatedSubtotal * 0.19;
        const calculatedTotal = calculatedSubtotal + calculatedVat;
        setSubtotal(calculatedSubtotal);
        setVat(calculatedVat);
        setTotal(calculatedTotal);
      } finally {
        setLoading(false);
      }
    };

    fetchCalculation();
  }, [plan, isYearly, planKey, promoCode, amountParam]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      alert('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/checkout/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: planKey,
          is_yearly: isYearly,
          email: email,
          payment_method: paymentMethod,
          promo_code: promoCode || null,
          ...(planKey === 'on-demand' && amountParam ? { amount: parseFloat(amountParam) } : {})
        })
      });

      if (response.ok) {
        const data = await response.json();
        // In production, this would redirect to Stripe/PayPal
        alert(`Payment intent created for ${plan.name}. Amount: ${data.amount}${data.currency}`);
        // For now, just show success message
        // In production: redirect to payment provider
      } else {
        const error = await response.json();
        alert(`Payment failed: ${error.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment processing failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return price.toFixed(2).replace('.', ',');
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#f5f5f5',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Left Panel - Dark Theme */}
      <div style={{
        width: '50%',
        background: '#1a1a1a',
        color: '#ececec',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1.5rem'
        }}>
          <Link href={planKey === 'on-demand' ? '/on-demand/setup' : `/pricing/${planKey}`} style={{
            color: '#ececec',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center'
          }}>
            <ArrowLeft size={18} />
          </Link>
          <AnimatedLogoIcon size={20} />
          <span style={{
            fontSize: '0.9rem',
            fontWeight: '600',
            color: '#ececec'
          }}>Vibe AI go</span>
        </div>

        {/* Subscription Title */}
        <h1 style={{
          fontSize: '1.25rem',
          fontWeight: '700',
          color: '#ececec',
          marginBottom: '1.5rem'
        }}>
          {planKey === 'on-demand' ? 'Add Credits to On Demand' : `Subscribe to ${plan.name}`}
        </h1>

        {/* Main Price */}
        <div style={{
          marginBottom: '0.75rem'
        }}>
          <div style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#ececec',
            marginBottom: '0.25rem'
          }}>
            {formatPrice(total)} {plan.currency}
          </div>
          <div style={{
            fontSize: '0.85rem',
            color: '#999'
          }}>
            {planKey === 'on-demand' ? 'one-time payment' : (isYearly ? 'per year' : 'per month')}
          </div>
        </div>

        {/* Monthly Equivalent or Change Amount Link */}
        {planKey === 'on-demand' ? (
          <div style={{
            fontSize: '0.85rem',
            color: '#3b82f6',
            marginBottom: '1.5rem',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
          onClick={() => router.push('/on-demand/setup')}
          >
            Change amount
          </div>
        ) : (
          <div style={{
            fontSize: '0.85rem',
            color: '#999',
            marginBottom: '1.5rem'
          }}>
            {formatPrice(isYearly ? plan.priceYearlyMonthly : plan.priceMonthly)} {plan.currency} / month, {isYearly ? 'billed annually' : 'billed monthly'}
          </div>
        )}

        {/* Itemized Costs */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            paddingBottom: '1rem',
            borderBottom: '1px solid #2f2f2f'
          }}>
            <div>
              <div style={{
                fontSize: '0.9rem',
                fontWeight: '500',
                color: '#ececec',
                marginBottom: '0.25rem'
              }}>
                {plan.name}
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: '#999'
              }}>
                {planKey === 'on-demand' ? 'One-time payment' : (isYearly ? 'Billed annually' : 'Billed monthly')}
              </div>
            </div>
            <div style={{
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#ececec'
            }}>
              {formatPrice(subtotal)} {plan.currency}
            </div>
          </div>

          {discount > 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid #2f2f2f'
            }}>
              <div style={{
                fontSize: '0.9rem',
                fontWeight: '500',
                color: '#ececec'
              }}>
                Discount
              </div>
              <div style={{
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#22c55e'
              }}>
                -{formatPrice(discount)} {plan.currency}
              </div>
            </div>
          )}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid #2f2f2f'
          }}>
            <div style={{
              fontSize: '0.9rem',
              fontWeight: '500',
              color: '#ececec'
            }}>
              Subtotal
            </div>
            <div style={{
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#ececec'
            }}>
              {formatPrice(subtotal)} {plan.currency}
            </div>
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Add promo code"
              style={{
                width: '100%',
                background: 'transparent',
                border: '1px solid #4a4a4a',
                color: '#ececec',
                padding: '0.625rem 0.875rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                outline: 'none'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#666'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#4a4a4a'}
            />
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid #2f2f2f'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{
                fontSize: '0.9rem',
                fontWeight: '500',
                color: '#ececec'
              }}>
                VAT (19%)
              </span>
              <Info size={14} color="#999" style={{ cursor: 'pointer' }} />
            </div>
            <div style={{
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#ececec'
            }}>
              {formatPrice(vat)} {plan.currency}
            </div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '0.75rem',
            marginTop: 'auto'
          }}>
            <div style={{
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#ececec'
            }}>
              Total due today
            </div>
            <div style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: '#ececec'
            }}>
              {formatPrice(total)} {plan.currency}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Light Theme */}
      <div style={{
        width: '50%',
        background: '#ffffff',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AnimatedLogoIcon size={20} />
            <span style={{
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#000'
            }}>Vibe AI go</span>
          </div>
          <div style={{
            cursor: 'pointer',
            fontSize: '1.25rem',
            color: '#666'
          }}>
            ⋯
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}>
          {/* Email Field */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.85rem',
              fontWeight: '500',
              color: '#333',
              marginBottom: '0.5rem'
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '0.9rem',
                background: '#fff',
                color: '#000'
              }}
            />
          </div>

          {/* Payment Method Field */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.85rem',
              fontWeight: '500',
              color: '#333',
              marginBottom: '0.5rem'
            }}>
              Payment
            </label>
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setShowPaymentDropdown(!showPaymentDropdown)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  background: '#fff',
                  color: '#000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  {paymentMethod === 'stripe' ? (
                    <>
                      <div style={{
                        width: '32px',
                        height: '20px',
                        background: '#635BFF',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '0.7rem',
                        fontWeight: '600'
                      }}>Stripe</div>
                      <span>Stripe Card</span>
                    </>
                  ) : (
                    <>
                      <div style={{
                        width: '32px',
                        height: '20px',
                        background: '#0070BA',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '0.7rem',
                        fontWeight: '600'
                      }}>PP</div>
                      <span>PayPal</span>
                    </>
                  )}
                </div>
                <ChevronDown size={18} color="#666" />
              </button>
              
              {showPaymentDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  marginTop: '0.25rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  zIndex: 1000
                }}>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('stripe');
                      setShowPaymentDropdown(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: 'none',
                      background: paymentMethod === 'stripe' ? '#f5f5f5' : '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '0.9rem'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                    onMouseLeave={(e) => e.currentTarget.style.background = paymentMethod === 'stripe' ? '#f5f5f5' : '#fff'}
                  >
                    <div style={{
                      width: '32px',
                      height: '20px',
                      background: '#635BFF',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '0.7rem',
                      fontWeight: '600'
                    }}>Stripe</div>
                    <span>Stripe Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('paypal');
                      setShowPaymentDropdown(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: 'none',
                      borderTop: '1px solid #ddd',
                      background: paymentMethod === 'paypal' ? '#f5f5f5' : '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '0.9rem'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                    onMouseLeave={(e) => e.currentTarget.style.background = paymentMethod === 'paypal' ? '#f5f5f5' : '#fff'}
                  >
                    <div style={{
                      width: '32px',
                      height: '20px',
                      background: '#0070BA',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '0.7rem',
                      fontWeight: '600'
                    }}>PP</div>
                    <span>PayPal</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: loading ? '#ccc' : '#22c55e',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: 'auto'
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.background = '#16a34a';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.background = '#22c55e';
            }}
          >
            {loading ? 'Processing...' : 'Subscribe with payment obligation'}
          </button>

          {/* Disclaimer */}
          <p style={{
            fontSize: '0.75rem',
            color: '#666',
            lineHeight: '1.5',
            margin: 0
          }}>
            By subscribing, you authorize Vibe AI go to bill you according to the terms until you cancel. By submitting the order, you agree to our{' '}
            <Link href="/terms" style={{ color: '#3b82f6', textDecoration: 'none' }}>Terms and Conditions</Link>
            {' '}and{' '}
            <Link href="/privacy" style={{ color: '#3b82f6', textDecoration: 'none' }}>Privacy Policy</Link>
            .
          </p>

          {/* Links */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            marginTop: '1rem'
          }}>
            <Link href="#" style={{
              color: '#3b82f6',
              textDecoration: 'none',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span>↻</span>
              Eligible for refund
            </Link>
            <Link href="#" style={{
              color: '#3b82f6',
              textDecoration: 'none',
              fontSize: '0.85rem'
            }}>
              Pay without Link
            </Link>
          </div>
        </form>

        {/* Footer */}
        <div style={{
          marginTop: 'auto',
          paddingTop: '1.5rem',
          borderTop: '1px solid #eee',
          fontSize: '0.75rem',
          color: '#999',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>Powered by stripe</span>
          <div style={{
            display: 'flex',
            gap: '1rem'
          }}>
            <Link href="/legal" style={{ color: '#999', textDecoration: 'none' }}>Legal</Link>
            <Link href="/refunds" style={{ color: '#999', textDecoration: 'none' }}>Refunds</Link>
            <Link href="/contact" style={{ color: '#999', textDecoration: 'none' }}>Contact</Link>
          </div>
        </div>
      </div>
    </div>
  );
}


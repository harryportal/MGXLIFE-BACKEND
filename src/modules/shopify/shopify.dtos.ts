export default interface Product {
    id: number;
    title: string;
    body_html: string;
    vendor: string;
    product_type: string;
    created_at: string;
    handle: string;
    updated_at: string;
    published_at: string;
    template_suffix: string;
    status: string;
    published_scope: string;
    tags: string;
    admin_graphql_api_id: string;
    variants: Variant[];
    options: Option[];
    images: Image[];
    image: Image;
  }

interface Variant {
    id: number;
    product_id: number;
    title: string;
    price: string;
    sku: string;
    position: number;
    inventory_policy: string;
    compare_at_price: string | null;
    fulfillment_service: string;
    inventory_management: string;
    option1: string;
    option2: string | null;
    option3: string | null;
    created_at: string;
    updated_at: string;
    taxable: boolean;
    barcode: string;
    grams: number;
    image_id: number | null;
    weight: number;
    weight_unit: string;
    inventory_item_id: number;
    inventory_quantity: number;
    old_inventory_quantity: number;
    requires_shipping: boolean;
    admin_graphql_api_id: string;
  }
  
  interface Option {
    id: number;
    product_id: number;
    name: string;
    position: number;
    values: string[];
  }
  
  interface Image {
    id: number;
    product_id: number;
    position: number;
    created_at: string;
    updated_at: string;
    alt: string | null;
    width: number;
    height: number;
    src: string;
    variant_ids: number[];
    admin_graphql_api_id: string;
  }

  export interface Order {
    id: number;
    admin_graphql_api_id: string;
    app_id: number;
    browser_ip: string;
    buyer_accepts_marketing: boolean;
    cancel_reason: string | null;
    cancelled_at: string | null;
    cart_token: string;
    checkout_id: number;
    checkout_token: string;
    client_details: ClientDetails;
    closed_at: string | null;
    confirmed: boolean;
    contact_email: string;
    created_at: string;
    currency: string;
    current_subtotal_price: string;
    current_subtotal_price_set: MoneySet;
    current_total_additional_fees_set: null | any;
    current_total_discounts: string;
    current_total_discounts_set: MoneySet;
    current_total_duties_set: null | any;
    current_total_price: string;
    current_total_price_set: MoneySet;
    current_total_tax: string;
    current_total_tax_set: MoneySet;
    customer_locale: string;
    device_id: string | null;
    discount_codes: any[];
    email: string;
    estimated_taxes: boolean;
    financial_status: string;
    fulfillment_status: string | null;
    landing_site: string;
    landing_site_ref: string;
    location_id: number | null;
    merchant_of_record_app_id: number | null;
    name: string;
    note: string | null;
    note_attributes: any[];
    number: number;
    order_number: number;
    order_status_url: string;
    original_total_additional_fees_set: null | any;
    original_total_duties_set: null | any;
    payment_gateway_names: string[];
    phone: string | null;
    presentment_currency: string;
    processed_at: string;
    reference: string;
    referring_site: string;
    source_identifier: string;
    source_name: string;
    source_url: string | null;
    subtotal_price: string;
    subtotal_price_set: MoneySet;
    tags: string;
    tax_lines: TaxLine[];
    taxes_included: boolean;
    test: boolean;
    token: string;
    total_discounts: string;
    total_discounts_set: MoneySet;
    total_line_items_price: string;
    total_line_items_price_set: MoneySet;
    total_outstanding: string;
    total_price: string;
    total_price_set: MoneySet;
    total_shipping_price_set: MoneySet;
    total_tax: string;
    total_tax_set: MoneySet;
    total_tip_received: string;
    total_weight: number;
    updated_at: string;
    user_id: number | null;
    billing_address: Address;
    customer: Customer;
    discount_applications: any[];
    fulfillments: Fulfillment[];
    line_items: LineItem[];
    payment_terms: string | null;
    refunds: any[];
    shipping_address: Address;
    shipping_lines: ShippingLine[];
  }
  
  interface ClientDetails {
    accept_language: string;
    browser_height: number | null;
    browser_ip: string;
    browser_width: number | null;
    session_hash: string | null;
    user_agent: string;
  }
  
  interface MoneySet {
    shop_money: Money;
    presentment_money: Money;
  }
  
  interface Money {
    amount: string;
    currency_code: string;
  }
  
  interface TaxLine {
    price: string;
    rate: number;
    title: string;
    price_set: MoneySet;
    channel_liable: boolean;
  }
  
  interface Address {
    first_name: string;
    address1: string;
    phone: string | null;
    city: string;
    zip: string;
    province: string;
    country: string;
    last_name: string;
    address2: string | null;
    company: string | null;
    latitude: number | null;
    longitude: number | null;
    name: string;
    country_code: string;
    province_code: string;
  }
  
  interface Customer {
    id: number;
    email: string;
    accepts_marketing: boolean;
    created_at: string;
    updated_at: string;
    first_name: string;
    last_name: string;
    state: string;
    note: string | null;
    verified_email: boolean;
    multipass_identifier: string | null;
    tax_exempt: boolean;
    phone: string | null;
    email_marketing_consent: EmailMarketingConsent;
    sms_marketing_consent: null | any;
    tags: string;
    currency: string;
    accepts_marketing_updated_at: string;
    marketing_opt_in_level: null | any;
    tax_exemptions: any[];
    admin_graphql_api_id: string;
    default_address: Address;
  }
  
  interface EmailMarketingConsent {
    state: string;
    opt_in_level: string;
    consent_updated_at: string | null;
  }
  
  interface Fulfillment {
    // Define fulfillment properties here
  }
  
  interface LineItem {
    id: number;
    admin_graphql_api_id: string;
    fulfillable_quantity: number;
    fulfillment_service: string;
    fulfillment_status: null | string;
    gift_card: boolean;
    grams: number;
    name: string;
    price: string;
    price_set: {
      shop_money: {
        amount: string;
        currency_code: string;
      };
      presentment_money: {
        amount: string;
        currency_code: string;
      };
    };
    product_exists: boolean;
    product_id: number;
    properties: any[]; // You can replace 'any' with a specific type if needed
    quantity: number;
    requires_shipping: boolean;
    sku: string;
    taxable: boolean;
    title: string;
    total_discount: string;
    total_discount_set: {
      shop_money: {
        amount: string;
        currency_code: string;
      };
      presentment_money: {
        amount: string;
        currency_code: string;
      };
    };
    variant_id: number;
    variant_inventory_management: string;
    variant_title: null | string;
    vendor: string;
    tax_lines: {
      price: string;
      rate: number;
      title: string;
      price_set: {
        shop_money: {
          amount: string;
          currency_code: string;
        };
        presentment_money: {
          amount: string;
          currency_code: string;
        };
      };
      channel_liable: boolean;
    }[];
    duties: any[]; // You can replace 'any' with a specific type if needed
    discount_allocations: any[]; // You can replace 'any' with a specific type if needed
  }
  
  
  interface ShippingLine {
    // Define shipping line properties here
  }
  
  
export type ProductCommission =  Pick<LineItem, "price" | "quantity" | "product_id">

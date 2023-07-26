<template>
  <div class="p-10">
    <h1 class="text-3xl font-bold mb-4">{{ title }}</h1>

    <form id="checkoutForm" method="GET" action="/" @submit.prevent="submitHandler">

      <div class="flex gap-2">
        <button type="submit" :class="styles.btnPrimary">{{ `Get Token` }}</button>

        <div class="flex gap-2">
          <button type="button" :class="styles.btn" @click="checkoutHandler(item.id)" v-for="(item, index) in methods"
            :key="index">{{ item.name }}</button>
        </div>
      </div>

    </form>
  </div>
</template>

<script>


export default {
  name: 'IndexPage',


  data() {
    return {
      title: 'Nuxtjs x omise',
      radeayOmise: false,
      omisePublicKey: process.env.OMISE_PUBLIC_KEY,
      omiseSecretKey: process.env.OMISE_SECRET_KEY,

      methods: [
        { id: `credit_card`, name: `Credit Card` },
        { id: `promptpay`, name: `Promptpay` },
        { id: `truemoney`, name: `True Money` },
        { id: `alipay`, name: `Alipay` },
        // { id: `barcode_wechat`, name: `Wechat` },
        { id: `rabbit_linepay`, name: `Rabbit LINE Pay` },
      ],

      payload: {
        amount: 400000,
        currency: "THB",
        description: "Order-345678",
      },

      styles: {
        btn: `pointer-events-auto rounded-md px-4 py-2 text-center font-medium shadow-sm ring-1 ring-slate-700/10 hover:bg-slate-50`,
        btnPrimary: `pointer-events-auto rounded-md bg-indigo-600 px-3 py-2 text-[0.8125rem] font-semibold leading-5 text-white hover:bg-indigo-500`,
      },
    }
  },

  async asyncData({ $axios }) {

    return { version: 1 }
  },

  // SEO
  head() {
    return {
      title: this.title,
      meta: [
        { hid: 'description', name: 'description', content: 'Home page description' }
      ],

      script: [
        { src: 'https://cdn.omise.co/omise.js', mode: 'client' },
        // { src: 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js', mode: 'client' }
      ]
    }
  },

  async mounted() {
    this.initOmise()

    // test api 
    const meta = await this.$axios.get('/hello', {
      params: {
        name: 'Chong'
      }
    });
    console.log('meta', meta, this.version);
  },

  methods: {
    initOmise() {
      if (typeof Omise === 'undefined') {
        console.log('Omise is undefined')
        return
      }

      Omise.setPublicKey(this.omisePublicKey)
      // Omise.setLocale('th')

      // console.log(window);
      // console.log(Omise);

      this.radeayOmise = true
    },

    checkoutHandler(methodName) {
      console.log('checkout Handler...', methodName);
      OmiseCard.configure({
        publicKey: this.omisePublicKey,
      });

      OmiseCard.open({
        ...this.payload,
        image: 'https://cdn.omise.co/assets/dashboard/images/omise-logo.png',
        frameLabel: 'Omise Payment Form',
        frameDescription: 'Invoice #3847 in THB',
        defaultPaymentMethod: methodName ?? 'credit_card',
        onCreateTokenSuccess: (response) => {
          console.log('onCreateTokenSuccess')
          this.omiseChargesBySourceId(methodName, response)
        },
        onFormClosed: () => {
          console.log('onFormClosed')
        },
      })
    },

    submitHandler() {
      if (!this.radeayOmise) {
        console.log('Omise is not ready')
        return
      }

      const payload = {
        name: 'JOHN DOE',
        number: '4242424242424242',
        expiration_month: 2,
        expiration_year: 2024,
        security_code: '123'
      }

      const vm = this;

      Omise.createToken('card', payload, (statusCode, response) => {
        if (statusCode === 200) {

          console.log('Success: ', response.id);
          vm.omiseChargesByToken(response.id)
        } else {
          console.log('Error: ' + response.message)
        }
      })
    },

    async omiseChargesBySourceId(type, sourceId) {

      console.log('sourceId', sourceId);
      const payload = {
        ...this.payload,
        // source: sourceId,
        // type: methodName
      }

      if (type == 'credit_card') {
        payload.card = sourceId
      }
      else {
        payload.source = sourceId
      }

      const response = await this.$axios.post('/omise/checkout', payload)
      console.log('response', response);
    },

    async omiseChargesByToken(tokenId) {

      const payload = {
        amount: 100000,
        currency: "THB",
        description: "Order-345678",
        card: tokenId,
      }

      // delay 1 sec
      await new Promise(resolve => setTimeout(resolve, 1800));

      const response = await this.$axios.post('/omise/checkout', payload)
      console.log(response);
    }

  }
}
</script>
# 📱 Guia para Gerar APK - Almoxarifado Mobile

Este guia explica como configurar e gerar o arquivo APK do aplicativo mobile.

---

## 📋 Pré-requisitos

1. **Node.js** instalado (versão 18 ou superior)
2. **npm** ou **yarn** instalado
3. **Expo CLI** instalado globalmente:
   ```bash
   npm install -g expo-cli
   ```
4. **EAS CLI** instalado (para build):
   ```bash
   npm install -g eas-cli
   ```
5. **Conta no Expo** (gratuita): https://expo.dev/signup

---

## 🚀 Configuração Inicial

### 1. Instalar Dependências

```bash
cd mobile
npm install
```

### 2. Configurar URL da API

Edite o arquivo `src/services/api.js`:

```javascript
// Para desenvolvimento local (teste no computador)
const API_BASE_URL = __DEV__
  ? 'http://SEU_IP_LOCAL:3000/api' // Ex: http://192.168.1.100:3000/api
  : 'https://private-appalmoxerifado.pbzgje.easypanel.host/api'; // Produção
```

**⚠️ IMPORTANTE:** Para testar no celular conectado à mesma rede WiFi:
- Descubra seu IP local:
  - Windows: `ipconfig` (Endereço IPv4)
  - Mac/Linux: `ifconfig` ou `ip addr`
- Use o IP no lugar de `localhost`
- Exemplo: `http://192.168.1.100:3000/api`

### 3. Testar no Expo Go (Opcional)

```bash
npm start
```

- Escaneie o QR code com o app **Expo Go** (disponível na Play Store)
- Teste as funcionalidades no celular

---

## 📦 Gerar APK para Produção

### Opção 1: Build com EAS (Recomendado)

#### 1.1. Login no Expo

```bash
eas login
```

#### 1.2. Configurar Projeto

```bash
eas build:configure
```

Isso criará o arquivo `eas.json` com as configurações de build.

#### 1.3. Gerar APK

```bash
eas build --platform android --profile preview
```

**Tipos de Build:**
- `preview` - APK para testes (sem assinatura da Google Play)
- `production` - AAB para publicar na Google Play Store

#### 1.4. Download do APK

Após o build (leva ~10-15 minutos):
- Acesse o link fornecido no terminal
- Faça download do arquivo `.apk`
- Instale no Android via USB ou transferência de arquivo

---

### Opção 2: Build Local (Mais Complexo)

#### 2.1. Instalar Android Studio

- Download: https://developer.android.com/studio
- Configurar variáveis de ambiente:
  - `ANDROID_HOME`
  - `JAVA_HOME`

#### 2.2. Gerar APK Local

```bash
npx expo prebuild
cd android
./gradlew assembleRelease
```

O APK estará em: `android/app/build/outputs/apk/release/app-release.apk`

---

## 🔧 Configurações Avançadas

### Personalizar Ícone e Splash Screen

Edite o arquivo `app.json`:

```json
{
  "expo": {
    "name": "Almoxarifado",
    "slug": "almoxarifado-mobile",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    }
  }
}
```

### Configurar Versão

No arquivo `app.json`:

```json
{
  "expo": {
    "version": "1.0.0",
    "android": {
      "versionCode": 1,
      "package": "com.suaempresa.almoxarifado"
    }
  }
}
```

---

## 🧪 Testar APK Antes de Distribuir

### No Emulador Android:

```bash
adb install caminho/para/app.apk
```

### No Celular Físico:

1. Habilitar **Instalação de Fontes Desconhecidas**:
   - Configurações → Segurança → Fontes Desconhecidas
2. Transferir APK via USB ou Google Drive
3. Instalar manualmente

---

## 📤 Distribuir APK

### Opção 1: Google Play Store (Oficial)

1. Criar conta de desenvolvedor (taxa única de $25)
2. Gerar AAB (Android App Bundle):
   ```bash
   eas build --platform android --profile production
   ```
3. Fazer upload no Google Play Console
4. Preencher informações (descrição, screenshots, etc.)
5. Enviar para revisão

### Opção 2: Distribuição Direta

- Hospedar APK em servidor próprio
- Enviar via WhatsApp/Email
- Usar plataformas como Firebase App Distribution

---

## 🐛 Solução de Problemas

### Erro: "Unable to resolve module"

```bash
cd mobile
rm -rf node_modules
npm install
npm start --reset-cache
```

### Erro: "Network request failed"

- Verificar se a API está rodando
- Verificar se a URL no `api.js` está correta
- Verificar firewall/antivírus

### Erro de Permissões (Câmera/Storage)

Adicionar no `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "Permitir $(PRODUCT_NAME) acessar a câmera para escanear QR codes."
        }
      ],
      [
        "expo-image-picker",
        {
          "photosPermission": "$(PRODUCT_NAME) precisa acessar suas fotos para adicionar imagens aos itens."
        }
      ]
    ]
  }
}
```

---

## 📊 Comparação: Expo Go vs APK

| Característica | Expo Go | APK Standalone |
|----------------|---------|----------------|
| Velocidade de teste | ⚡ Rápido | 🐢 Lento (build 10-15min) |
| Funciona offline | ❌ Não | ✅ Sim |
| Notificações Push | ⚠️ Limitado | ✅ Completo |
| Performance | ⚠️ Boa | ✅ Ótima |
| Distribuição | ❌ Não | ✅ Sim |

**Recomendação:**
- **Desenvolvimento:** Use Expo Go para testes rápidos
- **Produção:** Gere APK/AAB standalone

---

## 📝 Checklist Antes de Gerar APK

- [ ] URL da API está configurada corretamente
- [ ] Testado no Expo Go
- [ ] Ícone e splash screen personalizados
- [ ] Versão atualizada no `app.json`
- [ ] Permissões necessárias configuradas
- [ ] Testado login e funcionalidades principais
- [ ] Testado modo offline
- [ ] Package name único (Android)

---

## 🚀 Comandos Rápidos

```bash
# Instalar dependências
npm install

# Testar localmente
npm start

# Gerar APK de teste (EAS)
eas build --platform android --profile preview

# Gerar AAB para Play Store
eas build --platform android --profile production

# Verificar status do build
eas build:list
```

---

## 📚 Recursos Úteis

- [Documentação Expo](https://docs.expo.dev/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [Google Play Console](https://play.google.com/console)
- [React Native Docs](https://reactnative.dev/)

---

## 🎯 Próximos Passos

Após gerar o APK:

1. **Testar em múltiplos dispositivos**
   - Diferentes versões do Android
   - Diferentes tamanhos de tela

2. **Implementar Analytics**
   - Firebase Analytics
   - Expo Analytics

3. **Implementar Crash Reporting**
   - Sentry
   - Firebase Crashlytics

4. **Implementar Notificações Push**
   - Expo Notifications
   - Firebase Cloud Messaging

5. **Publicar na Play Store**
   - Criar conta de desenvolvedor
   - Preparar assets (screenshots, ícones)
   - Escrever descrição e política de privacidade
   - Submeter para revisão

---

**Sucesso! 🎉**

Se tiver dúvidas, consulte a [documentação completa do Expo](https://docs.expo.dev/).

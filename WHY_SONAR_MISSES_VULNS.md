# Guía: Por qué SonarQube no detecta vulnerabilidades complejas

## Problema

SonarQube Community/SonarCloud tiene limitaciones con JavaScript para detectar vulnerabilidades intencionales complejas como:
- XSS en templates
- SQL Injection simulada  
- Credenciales en URLs
- Endpoints sin autenticación

## Soluciones Implementadas

### 1. **ESLint con Plugin de Seguridad** ✅
- Detecta patrones de seguridad OWASP
- Genera reportes JSON
- Se importan en SonarQube
- Reglas: `eqeqeq`, `no-eval`, `security/*`

### 2. **npm audit** ✅
- Detecta vulnerabilidades en dependencias
- Verifica CVE públicos
- Se muestra en el workflow

### 3. **SonarQube Configuration** ✅
- Importa reportes de ESLint
- Habilita Security Hotspots
- Configura perfiles de seguridad

### 4. **Reportes JSON** ✅
- ESLint genera `eslint-report.json`
- SonarQube lee `sonar.externalIssuesReportPaths`
- Issues aparecen como "External Issues"

## Vulnerabilidades que AHORA detecta

| Vulnerabilidad | Herramienta | Cómo |
|---|---|---|
| SQL Injection (==) | ESLint | Regla `eqeqeq` |
| XSS (innerHTML) | ESLint Security | Detecta patrones |
| Credenciales en URL | ESLint Security | Detecta strings con credenciales |
| Missing Auth | Manual Code Review | Requiere análisis contextual |
| Sensitive Logging | ESLint | Detecta console.log de datos |
| Weak Comparisons | ESLint | Regla `eqeqeq` |

## Cómo Verificar la Detección

### En GitHub Actions
1. Ve a **Actions** → último workflow
2. Revisa logs de "ESLint with JSON report"
3. Busca issues reportados

### En SonarCloud
1. Ve a tu proyecto: https://sonarcloud.io
2. Sección **Issues** → ver issues importados
3. Sección **External Issues** → issues de ESLint
4. Sección **Security** → vulnerabilidades

## Para Mejorar Aún Más la Detección

### Opción 1: Usar Snyk (Gratuito)
```bash
npm install -g snyk
snyk test --json > snyk-report.json
```

### Opción 2: OWASP Dependency Check
```bash
npm install owasp-dependency-check
```

### Opción 3: SecurityCodeScan para más patrones
```bash
npm install security-code-scan
```

### Opción 4: Crear reglas personalizadas en SonarQube
- Ve a **Administration** → **Custom Quality Profiles**
- Agrega reglas específicas para tus vulnerabilidades

## Archivos Clave

- **`.eslintrc.json`** - Reglas de seguridad agresivas
- **`sonar-project.properties`** - Configuración de SonarQube
- **`.github/workflows/sonarqube_analysis.yml`** - Genera reportes JSON
- **`eslint-report.json`** - Reportes generados (no commitear)

## Próximos Pasos Recomendados

1. ✅ ESLint reportando issues
2. ✅ SonarQube importando reportes
3. ⏭️ Ver qué vulnerabilidades detecta
4. ⏭️ Si faltan algunas, agregar reglas custom
5. ⏭️ Considerar herramientas adicionales

---

**Nota**: Este proyecto tiene vulnerabilidades **intencionales** para fines educativos. SonarQube las detectará gradualmente conforme se optimiza la configuración.

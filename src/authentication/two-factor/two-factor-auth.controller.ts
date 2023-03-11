import {
  ClassSerializerInterceptor,
  Controller,
  Post,
  UseInterceptors,
  Res,
  UseGuards,
  Req,
  Body,
  UnauthorizedException,
  HttpCode,
} from '@nestjs/common'
import { Response } from 'express'

import { UsersService } from '../../users/users.service'
import { AuthenticationService } from '../authentication.service'
import JwtAuthenticationGuard from '../jwt-authentication.guard'
import RequestWithUser from '../requestWithUser.interface'
import { TwoFactorAuthenticationCodeDto } from './dto/two-factor-auth-code.dto'
import { TwoFactorAuthenticationService } from './two-factor-auth.service'

@Controller('2fa')
@UseInterceptors(ClassSerializerInterceptor)
export class TwoFactorAuthenticationController {
  constructor(
    private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
    private readonly usersService: UsersService,
    private readonly authenticationService: AuthenticationService,
  ) {}

  @Post('generate')
  @UseGuards(JwtAuthenticationGuard)
  async register(@Res() response: Response, @Req() request: RequestWithUser) {
    const { otpauthUrl } =
      await this.twoFactorAuthenticationService.generateTwoFactorAuthenticationSecret(request.user)

    return this.twoFactorAuthenticationService.pipeQrCodeStream(response, otpauthUrl)
  }

  @Post('turn-on')
  @HttpCode(200)
  @UseGuards(JwtAuthenticationGuard)
  async turnOnTwoFactorAuthentication(
    @Req() request: RequestWithUser,
    @Body() { twoFactorAuthenticationCode }: TwoFactorAuthenticationCodeDto,
  ) {
    const isCodeValid = this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
      twoFactorAuthenticationCode,
      request.user,
    )
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code')
    }
    await this.usersService.turnOnTwoFactorAuthentication(request.user.id)
    return {
      message: `2Factor Auth is enabled for user ${request.user.email}`,
    }
  }

  @Post('authenticate')
  @HttpCode(200)
  @UseGuards(JwtAuthenticationGuard)
  async authenticate(
    @Req() request: RequestWithUser,
    @Body() { twoFactorAuthenticationCode }: TwoFactorAuthenticationCodeDto,
  ) {
    const isCodeValid = this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
      twoFactorAuthenticationCode,
      request.user,
    )
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code')
    }

    const accessToken = this.authenticationService.getJwtAccessTokenWith2FA(request.user.id, true)

    request.res.setHeader('Authorization', `Bearer ${accessToken}`)

    const { id, email, name } = request.user
    return {
      accessToken,
      data: {
        id,
        email,
        name,
      },
    }
  }
}
